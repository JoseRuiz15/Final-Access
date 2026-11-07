import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useMultiplayerStore = defineStore('multiplayer', {
  state: () => ({
    socket: null,
    connected: false,
    connectionError: '',
    actionError: '',
    roomCode: null,
    roomName: '',
    maxPlayers: 4,
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
        return
      }

      const fallbackSocketUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL
        : `${window.location.protocol}//${window.location.hostname}:3001`
      const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL || fallbackSocketUrl
      const socketUrl = configuredSocketUrl
        .trim()
        .replace(/[\s,]+$/, '')
        .replace(/\/+$/, '')
      this.socket = io(socketUrl)

      this.socket.on('connect', () => {
        this.connected = true
        this.fetchRooms()
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
        this.players = data.players
        this.isPrivate = data.isPrivate // Guardar si es privada o pública
      })

      this.socket.on('roomJoined', (data) => {
        this.roomCode = data.roomCode
        this.roomName = data.name
        this.maxPlayers = data.maxPlayers
        this.players = data.players
        this.isPrivate = data.isPrivate
      })

      this.socket.on('playerJoined', (data) => {
        this.players = data.players
      })

      this.socket.on('playerReadyChange', (data) => {
        this.players = data.players
      })

      this.socket.on('playerLeft', (data) => {
        this.players = data.players
      })

      this.socket.on('newMessage', (msg) => {
        this.messages.push(msg)
      })

      this.socket.on('startGame', (data) => {
        this.gameStarted = true
        console.log('El juego comienza en:', data.map)
      })

      this.socket.on('roomList', (rooms) => {
        this.roomList = rooms
      })
    },
    createRoom(username, isPrivate, name, maxPlayers, friendUsernames = []) {
      this.username = username
      this.isPrivate = isPrivate
      this.actionError = ''
      this.socket.emit('createRoom', { username, isPrivate, name, maxPlayers, friendUsernames })
    },
    joinRoom(roomCode, username) {
      this.username = username
      this.actionError = ''
      this.socket.emit('joinRoom', { roomCode: roomCode.trim().toUpperCase(), username })
    },
    setReady() {
      this.socket.emit('setReady', { roomCode: this.roomCode })
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
        this.players = []
        this.messages = []
        this.gameStarted = false
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
