import type { Server as HttpServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { Server } from 'socket.io'
import { allowedOrigins } from '../config/env.js'
import {
  createLevel6Simulation,
  createLevel6Snapshot,
  setLevel6EnemyHealth,
  tickLevel6Simulation,
} from './level6Simulation.js'

interface MultiplayerPlayer {
  id: string
  username: string
  ready: boolean
  characterId: string
}

interface MultiplayerPlayerState {
  x: number
  y: number
  flipX: boolean
  moving: boolean
  dead: boolean
  attacking: boolean
  damaged: boolean
  attackAnimation?: string
}

interface MultiplayerKeyData {
  multiplayerId: string
  texture: string
  grupo: string
  color: string
  efecto: string
  correcta: boolean
  spawnX?: number
  spawnY?: number
  x?: number
  y?: number
}

interface MultiplayerEnemySnapshot {
  enemies: Record<string, Record<string, unknown>>
  projectiles: Array<Record<string, unknown>>
  defeatedEnemyIds: string[]
}

interface MultiplayerLevelState {
  startedAt: number
  playerLives: Record<string, number>
  playerDeaths: Record<string, number>
  enemyHealth: Record<string, number>
  defeatedEnemyIds: string[]
  brokenBoxIds: string[]
  collectedKeys: MultiplayerKeyData[]
  droppedKeys: MultiplayerKeyData[]
  doorOpen: boolean
}

interface MultiplayerMatchResult {
  winnerId: string
  winnerUsername: string
  endedAt: number
  durationSeconds: number
  enemiesDefeated: number
  boxesBroken: number
  deathsByPlayer: Record<string, number>
}

interface MultiplayerRoom {
  code: string
  name: string
  maxPlayers: number
  friendUsernames: string[]
  isPrivate: boolean
  players: MultiplayerPlayer[]
  status: 'waiting' | 'playing' | 'finished'
  matchResult: MultiplayerMatchResult | null
  playerStates: Record<string, MultiplayerPlayerState>
  enemySnapshot: MultiplayerEnemySnapshot
  simulation: ReturnType<typeof createLevel6Simulation> | null
  levelState: MultiplayerLevelState
  levelStateRevision: number
}

/** Monta el protocolo Socket.IO de salas en el mismo servidor HTTP de la API. */
export function attachMultiplayer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  })

  const rooms = new Map<string, MultiplayerRoom>()
  const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  const simulationTimer = setInterval(() => {
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
  simulationTimer.unref?.()

  function normalizeUsername(username: unknown): string {
    return String(username || '')
      .trim()
      .slice(0, 24)
      .toLocaleLowerCase()
  }

  function normalizeCharacterId(characterId: unknown): string {
    const normalized = String(characterId || '').trim().toLowerCase()
    return ['cosa1', 'cosa2', 'cosa3'].includes(normalized) ? normalized : 'cosa1'
  }

  function normalizeKeyData(keyData: unknown): MultiplayerKeyData | null {
    if (!keyData || typeof keyData !== 'object') return null

    const data = keyData as Record<string, unknown>
    const multiplayerId = String(data.multiplayerId || '').trim().slice(0, 40)
    const texture = String(data.texture || '').trim().slice(0, 48)
    if (!/^key-box-\d{1,2}$/.test(multiplayerId) || !/^[a-zA-Z0-9_-]+$/.test(texture)) return null

    const normalized: MultiplayerKeyData = {
      multiplayerId,
      texture,
      grupo: typeof data.grupo === 'string' ? data.grupo.slice(0, 40) : '',
      color: typeof data.color === 'string' ? data.color.slice(0, 40) : '',
      efecto: typeof data.efecto === 'string' ? data.efecto.slice(0, 40) : '',
      correcta: data.correcta === true,
    }
    ;(['spawnX', 'spawnY'] as const).forEach((coordinate) => {
      const value = Number(data[coordinate])
      if (Number.isFinite(value)) normalized[coordinate] = Math.max(-10000, Math.min(10000, value))
    })
    return normalized
  }

  function generateRoomCode(): string {
    let roomCode = ''

    do {
      roomCode = Array.from(
        randomBytes(8),
        (byte) => codeAlphabet[byte % codeAlphabet.length],
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

  function broadcastRoomLists(): void {
    for (const client of io.sockets.sockets.values()) {
      client.emit('roomList', getAvailableRooms(client.data.roomFilter, client.data.username))
    }
  }

  function broadcastLevelState(roomCode: string, room: MultiplayerRoom): void {
    room.levelStateRevision += 1
    io.to(roomCode).emit('levelStateUpdate', {
      levelState: room.levelState,
      revision: room.levelStateRevision,
    })
  }

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`)

    socket.on('clockPing', (data: { clientSentAt?: unknown } = {}) => {
      socket.emit('clockPong', {
        clientSentAt: Number(data.clientSentAt),
        serverAt: Date.now(),
      })
    })

    socket.on(
      'createRoom',
      (
        data: {
          username?: unknown
          isPrivate?: unknown
          name?: unknown
          maxPlayers?: unknown
          friendUsernames?: unknown
          characterId?: unknown
        } = {},
      ) => {
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
          socket.emit('error', { message: 'Escribe un nombre antes de crear la sala.' })
          return
        }
        if (!name) {
          socket.emit('error', { message: 'Escribe un nombre para la sala.' })
          return
        }

        const roomCode = generateRoomCode()
        const room: MultiplayerRoom = {
          code: roomCode,
          name,
          maxPlayers,
          friendUsernames: [...new Set([normalizeUsername(username), ...friendUsernames])],
          isPrivate,
          players: [],
          status: 'waiting',
          matchResult: null,
          playerStates: {},
          enemySnapshot: { enemies: {}, projectiles: [], defeatedEnemyIds: [] },
          simulation: null,
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
        }

        rooms.set(roomCode, room)
        void socket.join(roomCode)
        socket.data.username = normalizeUsername(username)
        socket.data.roomFilter = socket.data.roomFilter || 'public'
        room.players.push({ id: socket.id, username, ready: false, characterId })

        console.log(`Sala ${isPrivate ? 'PRIVADA' : 'PÚBLICA'} creada: ${roomCode} por ${username}`)
        socket.emit('roomCreated', {
          roomCode,
          name,
          maxPlayers,
          players: room.players,
          isPrivate,
          playerStates: room.playerStates,
          enemySnapshot: room.enemySnapshot,
        })
        broadcastRoomLists()
      },
    )

    socket.on('joinRoom', (data: {
      roomCode?: unknown
      username?: unknown
      characterId?: unknown
    } = {}) => {
      const roomCode = String(data.roomCode || '')
        .trim()
        .toUpperCase()
      const username = String(data.username || '')
        .trim()
        .slice(0, 24)
      const characterId = normalizeCharacterId(data.characterId)

      if (!username) {
        socket.emit('error', { message: 'Escribe un nombre antes de entrar a la sala.' })
        return
      }

      const room = rooms.get(roomCode)
      if (!room) {
        socket.emit('error', { message: 'La sala no existe.' })
        return
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('error', { message: 'La sala está llena.' })
        return
      }

      if (room.players.some((player) => player.id === socket.id)) {
        socket.emit('roomJoined', {
          roomCode,
          name: room.name,
          maxPlayers: room.maxPlayers,
          players: room.players,
          isPrivate: room.isPrivate,
          playerStates: room.playerStates,
          enemySnapshot: room.enemySnapshot,
        })
        return
      }

      void socket.join(roomCode)
      socket.data.username = normalizeUsername(username)
      room.players.push({ id: socket.id, username, ready: false, characterId })
      console.log(`${username} se unió a la sala ${roomCode}`)

      io.to(roomCode).emit('playerJoined', {
        players: room.players,
        playerStates: room.playerStates,
      })
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

    socket.on('listRooms', (data: { filter?: unknown; username?: unknown } = {}) => {
      const filter = data.filter === 'friends' ? 'friends' : 'public'
      const username = normalizeUsername(data.username)
      socket.data.username = username
      socket.data.roomFilter = filter
      socket.emit('roomList', getAvailableRooms(filter, username))
    })

    socket.on('setReady', (data: { roomCode?: unknown } = {}) => {
      const roomCode = String(data.roomCode || '')
        .trim()
        .toUpperCase()
      const room = rooms.get(roomCode)
      const player = room?.players.find((entry) => entry.id === socket.id)
      if (!room || !player) return

      player.ready = !player.ready
      io.to(roomCode).emit('playerReadyChange', { players: room.players })

      const allReady = room.players.length > 0 && room.players.every((entry) => entry.ready)
      if (room.status === 'waiting' && allReady && room.players.length >= 2) {
        room.status = 'playing'
        room.levelState.startedAt = Date.now()
        room.levelState.playerLives = Object.fromEntries(room.players.map((entry) => [entry.id, 3]))
        room.levelState.playerDeaths = Object.fromEntries(room.players.map((entry) => [entry.id, 0]))
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
    })

    socket.on(
      'playerState',
      (
        data: {
          roomCode?: unknown
          state?: {
            x?: unknown
            y?: unknown
            flipX?: unknown
            moving?: unknown
            dead?: unknown
            attacking?: unknown
            damaged?: unknown
            attackAnimation?: unknown
          }
        } = {},
      ) => {
        const roomCode = String(data.roomCode || '')
          .trim()
          .toUpperCase()
        const room = rooms.get(roomCode)
        if (!room || !room.players.some((player) => player.id === socket.id)) return

        const x = Number(data.state?.x)
        const y = Number(data.state?.y)
        if (!Number.isFinite(x) || !Number.isFinite(y)) return

        const state: MultiplayerPlayerState = {
          x,
          y,
          flipX: data.state?.flipX === true,
          moving: data.state?.moving === true,
          dead: data.state?.dead === true,
          attacking: data.state?.attacking === true,
          damaged: data.state?.damaged === true,
          attackAnimation: ['atacar', 'atacarQuieto', 'atacarAereo'].includes(
            String(data.state?.attackAnimation || ''),
          )
            ? String(data.state?.attackAnimation)
            : undefined,
        }
        room.playerStates[socket.id] = state
        socket.to(roomCode).emit('playerStateUpdate', { playerId: socket.id, state })
      },
    )

    socket.on(
      'enemyDamage',
      (
        data: {
          roomCode?: unknown
          enemyId?: unknown
          health?: unknown
          maxHealth?: unknown
        } = {},
      ) => {
        const roomCode = String(data.roomCode || '')
          .trim()
          .toUpperCase()
        const room = rooms.get(roomCode)
        if (!room || !room.players.some((player) => player.id === socket.id)) return

        const enemyId = String(data.enemyId || '')
          .trim()
          .slice(0, 80)
        const health = Number(data.health)
        const maxHealth = Number(data.maxHealth)
        if (!enemyId || !Number.isFinite(health) || !Number.isFinite(maxHealth) || maxHealth <= 0)
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
      },
    )

    socket.on(
      'playerLifeLost',
      (data: { roomCode?: unknown; livesRemaining?: unknown } = {}) => {
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
      },
    )

    socket.on('enemyDefeated', (data: { roomCode?: unknown; enemyId?: unknown } = {}) => {
      const roomCode = String(data.roomCode || '')
        .trim()
        .toUpperCase()
      const room = rooms.get(roomCode)
      if (!room || !room.players.some((player) => player.id === socket.id)) return

      const enemyId = String(data.enemyId || '')
        .trim()
        .slice(0, 80)
      if (!enemyId) return

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

    socket.on('boxBroken', (data: { roomCode?: unknown; boxId?: unknown } = {}) => {
      const roomCode = String(data.roomCode || '').trim().toUpperCase()
      const room = rooms.get(roomCode)
      const boxId = String(data.boxId || '').trim().slice(0, 32)
      if (
        !room ||
        room.status !== 'playing' ||
        !room.players.some((player) => player.id === socket.id) ||
        !/^box-\d{1,2}$/.test(boxId) ||
        room.levelState.brokenBoxIds.includes(boxId)
      ) return

      room.levelState.brokenBoxIds.push(boxId)
      broadcastLevelState(roomCode, room)
    })

    socket.on(
      'keyPickedUp',
      (data: { roomCode?: unknown; keyData?: unknown } = {}) => {
        const roomCode = String(data.roomCode || '').trim().toUpperCase()
        const room = rooms.get(roomCode)
        const keyData = normalizeKeyData(data.keyData)
        if (
          !room ||
          room.status !== 'playing' ||
          !room.players.some((player) => player.id === socket.id) ||
          !keyData
        ) return

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
      },
    )

    socket.on(
      'keyDropped',
      (data: { roomCode?: unknown; keyData?: unknown; x?: unknown; y?: unknown } = {}) => {
        const roomCode = String(data.roomCode || '').trim().toUpperCase()
        const room = rooms.get(roomCode)
        const keyData = normalizeKeyData(data.keyData)
        const x = Number(data.x)
        const y = Number(data.y)
        if (
          !room ||
          room.status !== 'playing' ||
          !room.players.some((player) => player.id === socket.id) ||
          !keyData ||
          !Number.isFinite(x) ||
          !Number.isFinite(y)
        ) return

        const collectedKey = room.levelState.collectedKeys.find(
          (entry) => entry.multiplayerId === keyData.multiplayerId,
        )
        if (!collectedKey) return

        const droppedKey: MultiplayerKeyData = {
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
      },
    )

    socket.on(
      'doorOpenRequest',
      (data: { roomCode?: unknown } = {}) => {
        const roomCode = String(data.roomCode || '').trim().toUpperCase()
        const room = rooms.get(roomCode)
        if (
          !room ||
          room.status !== 'playing' ||
          !room.players.some((player) => player.id === socket.id)
        ) return

        const hasCorrectKey = room.levelState.collectedKeys.some(
          (keyData) => keyData.texture === 'key4Grey' && keyData.correcta,
        )
        if (!hasCorrectKey) {
          socket.emit('doorOpenRejected', {
            message: 'Necesitas la llave correcta para abrir la puerta.',
          })
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
      },
    )

    socket.on('sendMessage', (data: { roomCode?: unknown; message?: unknown } = {}) => {
      const roomCode = String(data.roomCode || '')
        .trim()
        .toUpperCase()
      const room = rooms.get(roomCode)
      const player = room?.players.find((entry) => entry.id === socket.id)
      const message = String(data.message || '')
        .trim()
        .slice(0, 280)

      if (!player || !message) return

      io.to(roomCode).emit('newMessage', {
        username: player.username,
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    })

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`)

      rooms.forEach((room, roomCode) => {
        const playerIndex = room.players.findIndex((player) => player.id === socket.id)
        if (playerIndex === -1) return

        room.players.splice(playerIndex, 1)
        delete room.playerStates[socket.id]
        io.to(roomCode).emit('playerLeft', {
          players: room.players,
          playerStates: room.playerStates,
        })
        if (room.players.length === 0) rooms.delete(roomCode)
      })

      broadcastRoomLists()
    })
  })

  return io
}
