import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { lobbyApi } from '@/api/client'

export const useLobbyStore = defineStore('lobbies', () => {
  const lobbies = ref([])
  const currentLobby = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const ws = ref(null)
  const wsConnected = ref(false)

  const isInLobby = computed(() => !!currentLobby.value)
  const isCreator = computed(() => currentLobby.value?.creatorId === getCurrentUserId())
  const players = computed(() => currentLobby.value?.players || [])
  const allReady = computed(() => players.value.length > 0 && players.value.every((p) => p.isReady))

  function getCurrentUserId() {
    // This will be populated from auth store
    return null
  }

  async function fetchLobbies(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await lobbyApi.list(params)
      if (response.data.ok) {
        lobbies.value = response.data.lobbies || []
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar lobbies'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createLobby(data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await lobbyApi.create(data)
      if (response.data.ok) {
        currentLobby.value = response.data.lobby
        connectWebSocket(response.data.lobby.code)
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al crear lobby'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getLobby(code) {
    isLoading.value = true
    error.value = null
    try {
      const response = await lobbyApi.get(code)
      if (response.data.ok) {
        currentLobby.value = response.data.lobby
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cargar lobby'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function joinLobby(code, data) {
    isLoading.value = true
    error.value = null
    try {
      const response = await lobbyApi.join(code, data)
      if (response.data.ok) {
        currentLobby.value = { ...currentLobby.value, ...response.data }
        connectWebSocket(code)
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al unirse al lobby'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function leaveLobby() {
    if (!currentLobby.value) return
    const code = currentLobby.value.code
    isLoading.value = true
    error.value = null
    try {
      const response = await lobbyApi.leave(code)
      if (response.data.ok) {
        disconnectWebSocket()
        currentLobby.value = null
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al salir del lobby'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function setReady(ready) {
    if (!currentLobby.value) return
    const code = currentLobby.value.code
    isLoading.value = true
    error.value = null
    try {
      const response = await lobbyApi.setReady(code, ready)
      if (response.data.ok) {
        // Update local state immediately
        const player = players.value.find((p) => p.userId === getCurrentUserId())
        if (player) player.isReady = ready
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cambiar estado'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function startMatch() {
    if (!currentLobby.value) return
    const code = currentLobby.value.code
    isLoading.value = true
    error.value = null
    try {
      const response = await lobbyApi.start(code)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al iniciar partida'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function cancelLobby() {
    if (!currentLobby.value) return
    const code = currentLobby.value.code
    isLoading.value = true
    error.value = null
    try {
      const response = await lobbyApi.cancel(code)
      if (response.data.ok) {
        disconnectWebSocket()
        currentLobby.value = null
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al cancelar lobby'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function connectWebSocket(code) {
    const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
    const wsUrl = `${WS_BASE_URL}/ws/lobby/${code}`

    if (ws.value) {
      ws.value.close()
    }

    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      wsConnected.value = true
      console.log('WebSocket connected to lobby:', code)
    }

    ws.value.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        handleWsMessage(message)
      } catch (err) {
        console.error('Error parsing WS message:', err)
      }
    }

    ws.value.onclose = () => {
      wsConnected.value = false
      console.log('WebSocket disconnected from lobby:', code)
      // Attempt reconnection after 3 seconds
      setTimeout(() => {
        if (currentLobby.value && currentLobby.value.code === code) {
          connectWebSocket(code)
        }
      }, 3000)
    }

    ws.value.onerror = (err) => {
      console.error('WebSocket error:', err)
    }
  }

  function disconnectWebSocket() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      wsConnected.value = false
    }
  }

  function handleWsMessage(message) {
    switch (message.type) {
      case 'lobby_state':
        currentLobby.value = message.lobby
        break
      case 'player_joined':
        if (currentLobby.value) {
          currentLobby.value.players = message.players
        }
        break
      case 'player_left':
        if (currentLobby.value) {
          currentLobby.value.players = message.players
        }
        break
      case 'player_ready':
        if (currentLobby.value) {
          currentLobby.value.players = message.players
        }
        break
      case 'player_character':
        if (currentLobby.value) {
          currentLobby.value.players = message.players
        }
        break
      case 'lobby_cancelled':
        currentLobby.value = null
        disconnectWebSocket()
        break
      case 'match_started':
        // Navigate to game
        window.location.href = '/game' // Or use router
        break
      case 'error':
        error.value = message.message
        break
    }
  }

  function sendWsMessage(message) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message))
    }
  }

  function setReadyWs(ready) {
    sendWsMessage({ type: 'set_ready', ready })
  }

  function setCharacterWs(characterId) {
    sendWsMessage({ type: 'set_character', characterId })
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentLobby() {
    currentLobby.value = null
    disconnectWebSocket()
  }

  function setCurrentUserId(userId) {
    // Store userId for lobby operations
    this._currentUserId = userId
  }

  return {
    lobbies,
    currentLobby,
    isLoading,
    error,
    ws,
    wsConnected,
    isInLobby,
    isCreator,
    players,
    allReady,
    fetchLobbies,
    createLobby,
    getLobby,
    joinLobby,
    leaveLobby,
    setReady,
    startMatch,
    cancelLobby,
    connectWebSocket,
    disconnectWebSocket,
    setReadyWs,
    setCharacterWs,
    clearError,
    clearCurrentLobby,
    setCurrentUserId,
  }
})