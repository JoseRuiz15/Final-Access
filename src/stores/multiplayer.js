import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useMultiplayerStore = defineStore('multiplayer', {
  state: () => ({
    socket: null,
    connected: false,
    connectionError: '',
    roomCode: null,
    username: '',
    players: [],
    messages: [],
    gameStarted: false,
    isPrivate: false, // Bandera para la sala actual (privada o pública)
    publicRooms: [] // Lista de salas públicas descubiertas
  }),
  actions: {
    connect() {
      if (this.socket) {
        if (this.socket.connected) this.fetchPublicRooms()
        return
      }

      const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
      const socketUrl = configuredSocketUrl.trim().replace(/[\s,]+$/, '').replace(/\/+$/, '')
      this.socket = io(socketUrl)

      this.socket.on('connect', () => {
        this.connected = true
        this.fetchPublicRooms() // Cargar salas públicas al conectar
      })

      this.socket.on('disconnect', () => {
        this.connected = false
      })

      this.socket.on('error', (data) => {
        this.connectionError = data?.message || 'Ocurrió un error en el servidor multijugador.'
      })

      this.socket.on('connect_error', (error) => {
        this.connected = false
        this.connectionError = `No se pudo conectar al servidor multijugador: ${error.message}`
      })

      this.socket.on('roomCreated', (data) => {
        this.roomCode = data.roomCode
        this.players = data.players
        this.isPrivate = data.isPrivate // Guardar si es privada o pública
      })

      this.socket.on('roomJoined', (data) => {
        this.roomCode = data.roomCode
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

      this.socket.on('publicRoomList', (rooms) => {
        this.publicRooms = rooms
      })
    },
    createRoom(username, isPrivate) {
      this.username = username
      this.isPrivate = isPrivate
      this.connectionError = ''
      this.socket.emit('createRoom', { username, isPrivate })
    },
    joinRoom(roomCode, username) {
      this.username = username
      this.connectionError = ''
      this.socket.emit('joinRoom', { roomCode: roomCode.trim().toUpperCase(), username })
    },
    setReady() {
      this.socket.emit('setReady', { roomCode: this.roomCode })
    },
    sendMessage(message) {
      this.socket.emit('sendMessage', { 
        roomCode: this.roomCode, 
        message, 
        username: this.username 
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
        this.roomCode = null
        this.players = []
        this.messages = []
        this.gameStarted = false
        this.isPrivate = false
        this.publicRooms = []
      }
    },
    // Nueva acción para cargar salas públicas
    fetchPublicRooms() {
      if (this.socket) this.socket.emit('listPublicRooms')
    }
  }
})
