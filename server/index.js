import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { randomBytes } from 'node:crypto'
import {
  createLevel6Simulation,
  createLevel6Snapshot,
  setLevel6EnemyHealth,
  tickLevel6Simulation,
} from './src/realtime/level6Simulation.js'

const PORT = Number(process.env.SOCKET_PORT || 3001)
const app = express()
app.use(cors())
app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'socket.io', port: PORT })
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 45_000,
    skipMiddlewares: true,
  },
})

// Estado global de las salas
const rooms = new Map()
const pendingDisconnects = new Map()
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const level6SimulationTimer = setInterval(() => {
  const now = Date.now()
  rooms.forEach((room, roomCode) => {
    if (room.status !== 'playing' || !room.simulation) return

    const hits = tickLevel6Simulation(room.simulation, room.playerStates, now)
    hits.forEach(({ playerId, damage }) => {
      io.to(playerId).emit('playerDamaged', { playerId, damage })
    })
    room.enemySnapshot = createLevel6Snapshot(room.simulation, now)
    io.to(roomCode).emit('enemySnapshot', room.enemySnapshot)
  })
}, 50)
level6SimulationTimer.unref?.()

function normalizeUsername(username) {
  return String(username || '')
    .trim()
    .slice(0, 24)
    .toLocaleLowerCase()
}

function normalizeCharacterId(characterId) {
  const normalized = String(characterId || '').trim().toLowerCase()
  return ['cosa1', 'cosa2', 'cosa3'].includes(normalized) ? normalized : 'cosa1'
}

function normalizeKeyData(keyData) {
  if (!keyData || typeof keyData !== 'object') return null

  const multiplayerId = String(keyData.multiplayerId || '').trim().slice(0, 40)
  const texture = String(keyData.texture || '').trim().slice(0, 48)
  if (!/^key-box-\d{1,2}$/.test(multiplayerId) || !/^[a-zA-Z0-9_-]+$/.test(texture)) return null

  const normalized = {
    multiplayerId,
    texture,
    grupo: typeof keyData.grupo === 'string' ? keyData.grupo.slice(0, 40) : '',
    color: typeof keyData.color === 'string' ? keyData.color.slice(0, 40) : '',
    efecto: typeof keyData.efecto === 'string' ? keyData.efecto.slice(0, 40) : '',
    correcta: keyData.correcta === true,
  }
  ;['spawnX', 'spawnY'].forEach((coordinate) => {
    const value = Number(keyData[coordinate])
    if (Number.isFinite(value)) normalized[coordinate] = Math.max(-10000, Math.min(10000, value))
  })
  return normalized
}

function generateRoomCode() {
  let roomCode

  do {
    roomCode = Array.from(
      randomBytes(8),
      (byte) => ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length],
    ).join('')
  } while (rooms.has(roomCode))

  return roomCode
}

function getAvailableRooms(filter = 'public', username = '') {
  return Array.from(rooms.values())
    .filter((room) => {
      const available = room.status === 'waiting' && room.players.length < room.maxPlayers
      if (!available) return false
      if (filter === 'friends') {
        return room.isPrivate && room.friendUsernames.includes(normalizeUsername(username))
      }
      return !room.isPrivate
    })
    .map((room) => ({
      code: room.code,
      name: room.name,
      username: room.players[0]?.username || 'Jugador',
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
    }))
}

function broadcastRoomLists() {
  for (const client of io.sockets.sockets.values()) {
    client.emit('roomList', getAvailableRooms(client.data.roomFilter, client.data.username))
  }
}

function removeDisconnectedPlayer(roomCode, playerId) {
  const room = rooms.get(roomCode)
  if (!room) return
  const playerIndex = room.players.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) return

  room.players.splice(playerIndex, 1)
  delete room.playerStates[playerId]
  io.to(roomCode).emit('playerLeft', {
    players: room.players,
    playerStates: room.playerStates,
  })
  if (room.players.length === 0) rooms.delete(roomCode)
  broadcastRoomLists()
}

function broadcastLevelState(roomCode, room) {
  room.levelStateRevision += 1
  io.to(roomCode).emit('levelStateUpdate', {
    levelState: room.levelState,
    revision: room.levelStateRevision,
  })
}

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`)

  const pendingDisconnect = pendingDisconnects.get(socket.id)
  if (pendingDisconnect) {
    clearTimeout(pendingDisconnect)
    pendingDisconnects.delete(socket.id)
  }

  socket.on('clockPing', (data = {}) => {
    socket.emit('clockPong', {
      clientSentAt: Number(data.clientSentAt),
      serverAt: Date.now(),
    })
  })

  // --- GESTIÓN DE SALAS ---

  socket.on('createRoom', (data = {}) => {
    const username = String(data.username || '')
      .trim()
      .slice(0, 24)
    const name = String(data.name || '')
      .trim()
      .slice(0, 64)
    const isPrivate = data.isPrivate === true
    const requestedCapacity = Number(data.maxPlayers)
    const maxPlayers =
      Number.isInteger(requestedCapacity) && requestedCapacity >= 2 && requestedCapacity <= 10
        ? requestedCapacity
        : 4
    const friendUsernames = Array.isArray(data.friendUsernames)
      ? data.friendUsernames.map(normalizeUsername).filter(Boolean).slice(0, 20)
      : []
    const characterId = normalizeCharacterId(data.characterId)

    if (!username) {
      return socket.emit('error', { message: 'Escribe un nombre antes de crear la sala.' })
    }
    if (!name) {
      return socket.emit('error', { message: 'Escribe un nombre para la sala.' })
    }

    const roomCode = generateRoomCode()

    const newRoom = {
      code: roomCode,
      name,
      maxPlayers,
      friendUsernames: [...new Set([normalizeUsername(username), ...friendUsernames])],
      isPrivate: isPrivate === true,
      players: [],
      status: 'waiting',
      matchResult: null,
      playerStates: {},
      enemySnapshot: { enemies: {}, projectiles: [], defeatedEnemyIds: [] },
      levelState: {
        startedAt: 0,
        playerLives: {},
        playerDeaths: {},
        enemyHealth: {},
        defeatedEnemyIds: [],
        brokenBoxIds: [],
        collectedKeys: [],
        droppedKeys: [],
        doorOpen: false,
      },
      levelStateRevision: 0,
      simulation: null,
    }

    rooms.set(roomCode, newRoom)

    // Unir al creador a la sala
    socket.join(roomCode)
    socket.data.username = normalizeUsername(username)
    socket.data.roomFilter = socket.data.roomFilter || 'public'
    const player = { id: socket.id, username, ready: false, characterId }
    newRoom.players.push(player)
    newRoom.playerStates[socket.id] = {
      x: 58,
      y: 736,
      flipX: false,
      moving: false,
      dead: false,
      attacking: false,
      damaged: false,
    }

    console.log(
      `Sala ${newRoom.isPrivate ? 'PRIVADA' : 'PÚBLICA'} creada: ${roomCode} por ${username}`,
    )

    socket.emit('roomCreated', {
      roomCode,
      name: newRoom.name,
      maxPlayers: newRoom.maxPlayers,
      players: newRoom.players,
      isPrivate: newRoom.isPrivate,
      playerStates: newRoom.playerStates,
      enemySnapshot: newRoom.enemySnapshot,
    })
    broadcastRoomLists()
  })

  socket.on('joinRoom', (data = {}) => {
    const roomCode = String(data.roomCode || '')
      .trim()
      .toUpperCase()
    const username = String(data.username || '')
      .trim()
      .slice(0, 24)
    const characterId = normalizeCharacterId(data.characterId)

    if (!username) {
      return socket.emit('error', { message: 'Escribe un nombre antes de entrar a la sala.' })
    }

    const room = rooms.get(roomCode)

    if (!room) {
      return socket.emit('error', { message: 'La sala no existe.' })
    }

    if (room.players.length >= room.maxPlayers) {
      return socket.emit('error', { message: 'La sala está llena.' })
    }

    if (room.players.some((player) => player.id === socket.id)) {
      return socket.emit('roomJoined', {
        roomCode,
        name: room.name,
        maxPlayers: room.maxPlayers,
        players: room.players,
        isPrivate: room.isPrivate,
        playerStates: room.playerStates,
        enemySnapshot: room.enemySnapshot,
      })
    }

    socket.join(roomCode)
    socket.data.username = normalizeUsername(username)
    const player = { id: socket.id, username, ready: false, characterId }
    room.players.push(player)
    const spawnX = 58 + (room.players.length - 1) * 40
    room.playerStates[socket.id] = {
      x: spawnX,
      y: 736,
      flipX: false,
      moving: false,
      dead: false,
      attacking: false,
      damaged: false,
    }

    console.log(`${username} se unió a la sala ${roomCode}`)

    // Notificar a todos en la sala que alguien entró
    io.to(roomCode).emit('playerJoined', {
      players: room.players,
      playerStates: room.playerStates,
    })

    // Enviar datos iniciales al jugador que entró
    socket.emit('roomJoined', {
      roomCode,
      name: room.name,
      maxPlayers: room.maxPlayers,
      players: room.players,
      isPrivate: room.isPrivate,
      playerStates: room.playerStates,
      enemySnapshot: room.enemySnapshot,
    })
    broadcastRoomLists()
  })

  // --- LISTADO PÚBLICO Y SALAS PRIVADAS COMPARTIDAS CON AMIGOS ---
  socket.on('listRooms', (data = {}) => {
    const filter = data.filter === 'friends' ? 'friends' : 'public'
    const username = normalizeUsername(data.username)
    socket.data.username = username
    socket.data.roomFilter = filter
    socket.emit('roomList', getAvailableRooms(filter, username))
  })

  socket.on('syncRoom', (data = {}) => {
    const roomCode = String(data.roomCode || '').trim().toUpperCase()
    const room = rooms.get(roomCode)
    if (!room?.players.some((player) => player.id === socket.id)) return

    socket.join(roomCode)
    io.to(roomCode).emit('playerJoined', {
      players: room.players,
      playerStates: room.playerStates,
    })
    socket.emit('roomSync', {
      roomCode,
      name: room.name,
      maxPlayers: room.maxPlayers,
      players: room.players,
      isPrivate: room.isPrivate,
      status: room.status,
      playerStates: room.playerStates,
      enemySnapshot: room.enemySnapshot,
      levelState: room.levelState,
      levelStateRevision: room.levelStateRevision,
      matchResult: room.matchResult,
    })
  })

  // --- LÓGICA DE LOBBY ---

  socket.on('setReady', (data) => {
    const { roomCode } = data
    const room = rooms.get(roomCode)

    if (room) {
      const player = room.players.find((p) => p.id === socket.id)
      if (player) {
        player.ready = !player.ready
        io.to(roomCode).emit('playerReadyChange', { players: room.players })

        // Verificar si todos están listos
        const allReady = room.players.length > 0 && room.players.every((p) => p.ready)
        if (room.status === 'waiting' && allReady && room.players.length >= 2) {
          // Mínimo 2 para empezar
          room.status = 'playing'
          room.levelState.startedAt = Date.now()
          room.levelState.playerLives = Object.fromEntries(
            room.players.map((entry) => [entry.id, 3]),
          )
          room.levelState.playerDeaths = Object.fromEntries(
            room.players.map((entry) => [entry.id, 0]),
          )
          room.simulation = createLevel6Simulation(room.levelState.startedAt)
          room.enemySnapshot = createLevel6Snapshot(room.simulation, room.levelState.startedAt)
          io.to(roomCode).emit('startGame', {
            map: 'level6',
            startedAt: room.levelState.startedAt,
            levelState: room.levelState,
            levelStateRevision: room.levelStateRevision,
            enemySnapshot: room.enemySnapshot,
          })
          broadcastRoomLists()
        }
      }
    }
  })

  socket.on('playerState', (data = {}) => {
    const roomCode = String(data.roomCode || '')
      .trim()
      .toUpperCase()
    const room = rooms.get(roomCode)
    if (!room?.players.some((player) => player.id === socket.id)) return

    const x = Number(data.state?.x)
    const y = Number(data.state?.y)
    if (!Number.isFinite(x) || !Number.isFinite(y)) return

    const state = {
      x,
      y,
      flipX: data.state.flipX === true,
      moving: data.state.moving === true,
      dead: data.state.dead === true,
      attacking: data.state.attacking === true,
      damaged: data.state.damaged === true,
      attackAnimation: ['atacar', 'atacarQuieto', 'atacarAereo'].includes(
        String(data.state.attackAnimation || ''),
      )
        ? String(data.state.attackAnimation)
        : undefined,
    }
    room.playerStates[socket.id] = state
    socket.to(roomCode).emit('playerStateUpdate', { playerId: socket.id, state })
  })

  socket.on('playerLifeLost', (data = {}) => {
    const roomCode = String(data.roomCode || '').trim().toUpperCase()
    const room = rooms.get(roomCode)
    const belongsToRoom = room?.players.some((player) => player.id === socket.id)
    const reportedLives = Number(data.livesRemaining)
    if (
      !room ||
      room.status !== 'playing' ||
      !belongsToRoom ||
      !Number.isFinite(reportedLives)
    ) return

    const livesRemaining = Math.max(0, Math.min(3, Math.floor(reportedLives)))
    const previousDeaths = Number(room.levelState.playerDeaths[socket.id]) || 0
    const deaths = Math.max(previousDeaths, 3 - livesRemaining)
    if (deaths === previousDeaths) return

    room.levelState.playerDeaths[socket.id] = deaths
    room.levelState.playerLives[socket.id] = 3 - deaths
    broadcastLevelState(roomCode, room)
  })

  socket.on('enemyDamage', (data = {}) => {
    const roomCode = String(data.roomCode || '')
      .trim()
      .toUpperCase()
    const room = rooms.get(roomCode)
    const isMember = room?.players.some((player) => player.id === socket.id)
    const enemyId = String(data.enemyId || '')
      .trim()
      .slice(0, 80)
    const health = Number(data.health)
    const maxHealth = Number(data.maxHealth)
    if (
      !isMember ||
      !enemyId ||
      !Number.isFinite(health) ||
      !Number.isFinite(maxHealth) ||
      maxHealth <= 0
    )
      return

    const nextHealth = Math.max(0, Math.min(maxHealth, health))
    const previousHealth = room.levelState.enemyHealth[enemyId]
    room.levelState.enemyHealth[enemyId] = Number.isFinite(previousHealth)
      ? Math.min(previousHealth, nextHealth)
      : nextHealth
    setLevel6EnemyHealth(room.simulation, enemyId, room.levelState.enemyHealth[enemyId])
    if (
      room.levelState.enemyHealth[enemyId] <= 0 &&
      !room.levelState.defeatedEnemyIds.includes(enemyId)
    ) {
      room.levelState.defeatedEnemyIds.push(enemyId)
    }
    room.levelStateRevision += 1
    io.to(roomCode).emit('levelStateUpdate', {
      levelState: room.levelState,
      revision: room.levelStateRevision,
    })
  })

  socket.on('enemyDefeated', (data = {}) => {
    const roomCode = String(data.roomCode || '')
      .trim()
      .toUpperCase()
    const room = rooms.get(roomCode)
    const isMember = room?.players.some((player) => player.id === socket.id)
    const enemyId = String(data.enemyId || '')
      .trim()
      .slice(0, 80)
    if (!isMember || !enemyId) return

    room.levelState.enemyHealth[enemyId] = 0
    setLevel6EnemyHealth(room.simulation, enemyId, 0)
    if (!room.levelState.defeatedEnemyIds.includes(enemyId))
      room.levelState.defeatedEnemyIds.push(enemyId)
    room.levelStateRevision += 1
    io.to(roomCode).emit('levelStateUpdate', {
      levelState: room.levelState,
      revision: room.levelStateRevision,
    })
  })

  socket.on('boxBroken', (data = {}) => {
    const roomCode = String(data.roomCode || '').trim().toUpperCase()
    const room = rooms.get(roomCode)
    const boxId = String(data.boxId || '').trim().slice(0, 32)
    if (
      room?.status !== 'playing' ||
      !room.players.some((player) => player.id === socket.id) ||
      !/^box-\d{1,2}$/.test(boxId) ||
      room.levelState.brokenBoxIds.includes(boxId)
    ) return

    room.levelState.brokenBoxIds.push(boxId)
    broadcastLevelState(roomCode, room)
  })

  socket.on('keyPickedUp', (data = {}) => {
    const roomCode = String(data.roomCode || '').trim().toUpperCase()
    const room = rooms.get(roomCode)
    const keyData = normalizeKeyData(data.keyData)
    if (room?.status !== 'playing' || !room.players.some((player) => player.id === socket.id) || !keyData)
      return

    const boxId = `box-${keyData.multiplayerId.slice('key-box-'.length)}`
    const wasSpawned = room.levelState.brokenBoxIds.includes(boxId)
    const isDropped = room.levelState.droppedKeys.some(
      (entry) => entry.multiplayerId === keyData.multiplayerId,
    )
    if (!wasSpawned && !isDropped) return
    if (room.levelState.collectedKeys.some((entry) => entry.multiplayerId === keyData.multiplayerId))
      return

    room.levelState.collectedKeys.push(keyData)
    room.levelState.droppedKeys = room.levelState.droppedKeys.filter(
      (entry) => entry.multiplayerId !== keyData.multiplayerId,
    )
    broadcastLevelState(roomCode, room)
  })

  socket.on('keyDropped', (data = {}) => {
    const roomCode = String(data.roomCode || '').trim().toUpperCase()
    const room = rooms.get(roomCode)
    const keyData = normalizeKeyData(data.keyData)
    const x = Number(data.x)
    const y = Number(data.y)
    if (
      room?.status !== 'playing' ||
      !room.players.some((player) => player.id === socket.id) ||
      !keyData ||
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) return

    const collectedKey = room.levelState.collectedKeys.find(
      (entry) => entry.multiplayerId === keyData.multiplayerId,
    )
    if (!collectedKey) return

    const droppedKey = {
      ...collectedKey,
      x: Math.max(-10000, Math.min(10000, x)),
      y: Math.max(-10000, Math.min(10000, y)),
    }
    room.levelState.collectedKeys = room.levelState.collectedKeys.filter(
      (entry) => entry.multiplayerId !== keyData.multiplayerId,
    )
    room.levelState.droppedKeys = [
      ...room.levelState.droppedKeys.filter((entry) => entry.multiplayerId !== keyData.multiplayerId),
      droppedKey,
    ]
    broadcastLevelState(roomCode, room)
  })

  socket.on('doorOpenRequest', (data = {}) => {
    const roomCode = String(data.roomCode || '').trim().toUpperCase()
    const room = rooms.get(roomCode)
    if (
      !room ||
      room.status !== 'playing' ||
      !room.players.some((player) => player.id === socket.id)
    ) return

    const hasCorrectKey = room.levelState.collectedKeys.some(
      (keyData) => keyData.texture === 'key4Grey' && keyData.correcta === true,
    )
    if (!hasCorrectKey) {
      socket.emit('doorOpenRejected', { message: 'Necesitas la llave correcta para abrir la puerta.' })
      return
    }

    const winner = room.players.find((player) => player.id === socket.id)
    if (!winner) return

    const endedAt = Date.now()
    room.status = 'finished'
    room.simulation = null
    room.levelState.doorOpen = true
    room.matchResult = {
      winnerId: winner.id,
      winnerUsername: winner.username,
      endedAt,
      durationSeconds: Math.max(0, Math.floor((endedAt - room.levelState.startedAt) / 1000)),
      enemiesDefeated: room.levelState.defeatedEnemyIds.length,
      boxesBroken: room.levelState.brokenBoxIds.length,
      deathsByPlayer: Object.fromEntries(
        room.players.map((player) => [player.id, room.levelState.playerDeaths[player.id] || 0]),
      ),
    }

    broadcastLevelState(roomCode, room)
    io.to(roomCode).emit('matchEnded', room.matchResult)
    broadcastRoomLists()
  })

  // --- CHAT ---

  socket.on('sendMessage', (data = {}) => {
    const roomCode = String(data.roomCode || '')
      .trim()
      .toUpperCase()
    const room = rooms.get(roomCode)
    const player = room?.players.find((entry) => entry.id === socket.id)
    const message = String(data.message || '')
      .trim()
      .slice(0, 280)

    if (!player || !message) return

    // Retransmitir el mensaje a todos en la sala incluyendo el remitente
    io.to(roomCode).emit('newMessage', {
      username: player.username,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  })

  // --- DESCONEXIÓN ---

  socket.on('disconnect', (reason) => {
    console.log(`Usuario desconectado: ${socket.id} (${reason})`)

    const mayReconnect = ['ping timeout', 'transport close', 'transport error'].includes(reason)
    rooms.forEach((room, roomCode) => {
      if (!room.players.some((player) => player.id === socket.id)) return

      delete room.playerStates[socket.id]
      if (!mayReconnect) {
        removeDisconnectedPlayer(roomCode, socket.id)
        return
      }

      const existingTimer = pendingDisconnects.get(socket.id)
      if (existingTimer) clearTimeout(existingTimer)
      const timer = setTimeout(() => {
        pendingDisconnects.delete(socket.id)
        removeDisconnectedPlayer(roomCode, socket.id)
      }, 50_000)
      pendingDisconnects.set(socket.id, timer)
    })
  })
})

// El API Fastify ya usa el puerto 3000; Socket.IO corre aparte en el 3001.
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Multijugador corriendo en http://localhost:${PORT}`)
})
