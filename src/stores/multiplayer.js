import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

const createEmptyLevelState = () => ({
  startedAt: 0,
  playerLives: {},
  playerDeaths: {},
  enemyHealth: {},
  defeatedEnemyIds: [],
  brokenBoxIds: [],
  collectedKeys: [],
  droppedKeys: [],
  doorOpen: false,
})

export const useMultiplayerStore = defineStore('multiplayer', {
  state: () => ({
    socket: null,
    connected: false,
    connectionError: '',
    actionError: '',
    roomCode: null,
    roomName: '',
    maxPlayers: 4,
    matchResult: null,
    gameMap: null,
    levelState: createEmptyLevelState(),
    levelStateRevision: 0,
    defeatedEnemyIds: [],
    playerStates: {},
    enemySnapshot: { enemies: {}, projectiles: [], defeatedEnemyIds: [] },
    enemySnapshotHistory: [],
    serverClockOffsetMs: 0,
    incomingPlayerHits: [],
    username: '',
    players: [],
    messages: [],
    gameStarted: false,
    isPrivate: false, // Bandera para la sala actual (privada o pública)
    roomList: [],
    roomListFilter: 'public',
  }),
  actions: {
    connect() {
      if (this.socket) {
        if (this.socket.connected) this.fetchRooms()
        else if (!this.socket.active) this.socket.connect()
        return
      }

      const fallbackSocketUrl = import.meta.env.VITE_SOCKET_URL
        ? import.meta.env.VITE_SOCKET_URL
        : `${window.location.protocol}//${window.location.hostname}:3001`
      const configuredSocketUrl = fallbackSocketUrl
      const socketUrl = configuredSocketUrl
        .trim()
        .replace(/[\s,]+$/, '')
        .replace(/\/+$/, '')
      this.socket = io(socketUrl)

      this.socket.on('connect', () => {
        this.connected = true
        this.fetchRooms()
        this.socket.emit('clockPing', { clientSentAt: Date.now() })
        if (this.roomCode) this.socket.emit('syncRoom', { roomCode: this.roomCode })
      })

      this.socket.on('clockPong', ({ clientSentAt, serverAt } = {}) => {
        const sentAt = Number(clientSentAt)
        const serverTime = Number(serverAt)
        if (!Number.isFinite(sentAt) || !Number.isFinite(serverTime)) return
        const midpoint = (sentAt + Date.now()) / 2
        const offset = serverTime - midpoint
        this.serverClockOffsetMs = this.serverClockOffsetMs
          ? this.serverClockOffsetMs * 0.75 + offset * 0.25
          : offset
      })

      this.socket.on('disconnect', () => {
        this.connected = false
      })

      this.socket.on('error', (data) => {
        this.actionError = data?.message || 'Ocurrió un error en el servidor multijugador.'
      })

      this.socket.on('connect_error', (error) => {
        this.connected = false
        this.connectionError = `No se pudo conectar al servidor multijugador: ${error.message}`
      })

      this.socket.on('roomCreated', (data) => {
        this.roomCode = data.roomCode
        this.roomName = data.name
        this.maxPlayers = data.maxPlayers
        this.matchResult = null
        this.gameStarted = false
        this.gameMap = null
        this.levelState = createEmptyLevelState()
        this.levelStateRevision = 0
        this.defeatedEnemyIds = []
        this.incomingPlayerHits = []
        this.playerStates = data.playerStates || {}
        this.enemySnapshot = data.enemySnapshot || { enemies: {}, projectiles: [], defeatedEnemyIds: [] }
        this.enemySnapshotHistory = data.enemySnapshot?.sequence ? [data.enemySnapshot] : []
        this.players = data.players
        this.isPrivate = data.isPrivate // Guardar si es privada o pública
      })

      this.socket.on('roomJoined', (data) => {
        this.roomCode = data.roomCode
        this.roomName = data.name
        this.maxPlayers = data.maxPlayers
        this.matchResult = null
        this.gameStarted = false
        this.gameMap = null
        this.levelState = createEmptyLevelState()
        this.levelStateRevision = 0
        this.defeatedEnemyIds = []
        this.incomingPlayerHits = []
        this.playerStates = data.playerStates || {}
        this.enemySnapshot = data.enemySnapshot || { enemies: {}, projectiles: [], defeatedEnemyIds: [] }
        this.enemySnapshotHistory = data.enemySnapshot?.sequence ? [data.enemySnapshot] : []
        this.players = data.players
        this.isPrivate = data.isPrivate
      })

      this.socket.on('playerJoined', (data) => {
        this.players = data.players
        this.playerStates = { ...this.playerStates, ...(data.playerStates || {}) }
      })

      this.socket.on('playerReadyChange', (data) => {
        this.players = data.players
      })

      this.socket.on('playerLeft', (data) => {
        this.players = data.players
        this.playerStates = data.playerStates || Object.fromEntries(
          Object.entries(this.playerStates).filter(([id]) => data.players.some((player) => player.id === id)),
        )
      })

      this.socket.on('playerStateUpdate', ({ playerId, state } = {}) => {
        if (!playerId || !state) return
        this.playerStates = { ...this.playerStates, [playerId]: state }
      })

      this.socket.on('enemySnapshot', (snapshot) => {
        if (!snapshot || typeof snapshot !== 'object') return
        this.enemySnapshot = snapshot
        const history = this.enemySnapshotHistory
        const last = history[history.length - 1]
        if (!last || Number(snapshot.sequence) > Number(last.sequence)) {
          this.enemySnapshotHistory = [...history, snapshot].slice(-6)
        }
        this.defeatedEnemyIds = snapshot.defeatedEnemyIds || this.defeatedEnemyIds
      })

      this.socket.on('levelStateUpdate', ({ levelState, revision } = {}) => {
        if (!levelState) return
        this.levelState = levelState
        this.levelStateRevision = Number(revision) || this.levelStateRevision + 1
        this.defeatedEnemyIds = levelState.defeatedEnemyIds || []
      })

      this.socket.on('playerDamaged', (hit) => {
        if (!hit || hit.playerId !== this.socket?.id) return
        this.incomingPlayerHits.push(hit)
      })

      this.socket.on('matchEnded', (result) => {
        if (!result?.winnerId) return
        this.matchResult = result
      })

      this.socket.on('newMessage', (msg) => {
        this.messages.push(msg)
      })

      this.socket.on('startGame', (data = {}) => {
        this.gameMap = data.map || 'level6'
        if (data.enemySnapshot) {
          this.enemySnapshot = data.enemySnapshot
          this.enemySnapshotHistory = [data.enemySnapshot]
        }
        this.levelState = {
          ...this.levelState,
          ...(data.levelState || {}),
          startedAt: Number(data.startedAt) || Date.now(),
        }
        this.levelStateRevision = Number(data.levelStateRevision) || this.levelStateRevision
        this.defeatedEnemyIds = this.levelState.defeatedEnemyIds || []
        this.matchResult = null
        this.gameStarted = true
        console.log('El juego comienza en:', this.gameMap)
      })

      this.socket.on('roomList', (rooms) => {
        this.roomList = rooms
      })

      this.socket.on('roomSync', (data = {}) => {
        if (!data.roomCode || data.roomCode !== this.roomCode) return

        this.roomName = data.name || this.roomName
        this.maxPlayers = Number(data.maxPlayers) || this.maxPlayers
        this.players = Array.isArray(data.players) ? data.players : this.players
        this.playerStates = data.playerStates || {}
        this.enemySnapshot = data.enemySnapshot || this.enemySnapshot
        if (data.enemySnapshot?.sequence) {
          this.enemySnapshotHistory = [data.enemySnapshot]
        }
        if (data.levelState) {
          this.levelState = data.levelState
          this.defeatedEnemyIds = data.levelState.defeatedEnemyIds || []
        }
        const revision = Number(data.levelStateRevision)
        if (Number.isFinite(revision)) this.levelStateRevision = revision
        this.isPrivate = data.isPrivate === true

        if (data.status === 'playing' || data.status === 'finished') {
          this.gameMap = 'level6'
          this.gameStarted = true
        }
        if (data.status === 'playing') this.matchResult = null
        if (data.status === 'finished' && data.matchResult) {
          this.matchResult = data.matchResult
        }
      })
    },
    createRoom(username, isPrivate, name, maxPlayers, friendUsernames = [], characterId = 'cosa1') {
      this.username = username
      this.isPrivate = isPrivate
      this.actionError = ''
      this.socket.emit('createRoom', {
        username,
        isPrivate,
        name,
        maxPlayers,
        friendUsernames,
        characterId,
      })
    },
    joinRoom(roomCode, username, characterId = 'cosa1') {
      this.username = username
      this.actionError = ''
      this.socket.emit('joinRoom', {
        roomCode: roomCode.trim().toUpperCase(),
        username,
        characterId,
      })
    },
    setReady() {
      this.socket.emit('setReady', { roomCode: this.roomCode })
    },
    sendPlayerState(state) {
      if (!this.socket?.connected || !this.roomCode) return
      this.playerStates = { ...this.playerStates, [this.socket.id]: state }
      this.socket.emit('playerState', { roomCode: this.roomCode, state })
    },
    reportEnemyDamage(enemyId, health, maxHealth) {
      if (!this.socket?.connected || !this.roomCode) return
      this.socket.emit('enemyDamage', { roomCode: this.roomCode, enemyId, health, maxHealth })
    },
    reportEnemyDefeated(enemyId) {
      if (!this.socket?.connected || !this.roomCode) return
      this.socket.emit('enemyDefeated', { roomCode: this.roomCode, enemyId })
    },
    reportBoxBroken(boxId) {
      if (!this.socket?.connected || !this.roomCode) return
      this.socket.emit('boxBroken', { roomCode: this.roomCode, boxId })
    },
    reportKeyPickedUp(keyData) {
      if (!this.socket?.connected || !this.roomCode || !keyData?.multiplayerId) return
      this.socket.emit('keyPickedUp', { roomCode: this.roomCode, keyData })
    },
    reportKeyDropped(keyData, x, y) {
      if (!this.socket?.connected || !this.roomCode || !keyData?.multiplayerId) return
      this.socket.emit('keyDropped', { roomCode: this.roomCode, keyData, x, y })
    },
    reportLifeLost(livesRemaining) {
      if (!this.socket?.connected || !this.roomCode) return
      this.socket.emit('playerLifeLost', { roomCode: this.roomCode, livesRemaining })
    },
    requestDoorOpen() {
      if (!this.socket?.connected || !this.roomCode || this.matchResult) return
      this.socket.emit('doorOpenRequest', { roomCode: this.roomCode })
    },
    sendMessage(message) {
      this.socket.emit('sendMessage', {
        roomCode: this.roomCode,
        message,
        username: this.username,
      })
    },
    limpiarChat() {
      this.messages = []
    },
    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
        this.connected = false
        this.connectionError = ''
        this.actionError = ''
        this.roomCode = null
        this.roomName = ''
        this.maxPlayers = 4
        this.matchResult = null
        this.players = []
        this.messages = []
        this.gameStarted = false
        this.gameMap = null
        this.levelState = createEmptyLevelState()
        this.levelStateRevision = 0
        this.defeatedEnemyIds = []
        this.playerStates = {}
        this.enemySnapshot = { enemies: {}, projectiles: [], defeatedEnemyIds: [] }
        this.enemySnapshotHistory = []
        this.serverClockOffsetMs = 0
        this.incomingPlayerHits = []
        this.isPrivate = false
        this.roomList = []
      }
    },
    fetchRooms(filter = this.roomListFilter) {
      this.roomListFilter = filter
      if (this.socket) {
        this.socket.emit('listRooms', { filter, username: this.username })
      }
    },
    setUsername(username) {
      this.username = String(username || '').trim()
    },
  },
})
