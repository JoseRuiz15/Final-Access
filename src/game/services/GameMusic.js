import musicLevel1 from '@/assets/music/musicLevel1.mp3'

const MUSIC_STATE_KEY = '__finalAccessGameMusic_v5'
const VOLUME_STORAGE_KEY = 'finalAccess.musicVolume'
const DEFAULT_VOLUME = 0.5

function readSavedVolume() {
  try {
    const stored = window.localStorage.getItem(VOLUME_STORAGE_KEY)
    if (stored === null) return DEFAULT_VOLUME

    const volume = Number(stored)
    return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_VOLUME
  } catch {
    return DEFAULT_VOLUME
  }
}

function shouldBeAudible(state) {
  return state.gameActive && state.windowFocused && document.visibilityState === 'visible'
}

function syncMusic(state, retryPlayback = false) {
  const audible = shouldBeAudible(state)
  state.audio.muted = !audible || state.volume === 0

  if (audible && retryPlayback && state.audio.paused) {
    state.audio.play().catch((error) => {
      if (error?.name !== 'NotAllowedError') {
        console.error('No se pudo iniciar la música del juego:', error)
      }
    })
  }
}

function getMusicState() {
  for (const oldKey of [
    '__finalAccessGameMusic',
    '__finalAccessGameMusic_v2',
    '__finalAccessGameMusic_v3',
    '__finalAccessGameMusic_v4',
  ]) {
    window[oldKey]?.audio?.pause()
    delete window[oldKey]
  }

  if (!window[MUSIC_STATE_KEY]) {
    const audio = new Audio(musicLevel1)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = readSavedVolume()
    audio.muted = true

    const state = {
      audio,
      volume: audio.volume,
      gameActive: false,
      windowFocused: true,
      preloadStarted: false,
    }

    const resumeIfActive = () => syncMusic(state, true)
    window.addEventListener('focus', () => {
      state.windowFocused = true
      resumeIfActive()
    })
    window.addEventListener('blur', () => {
      state.windowFocused = false
      syncMusic(state)
    })
    window.addEventListener('pointerdown', resumeIfActive)
    window.addEventListener('keydown', resumeIfActive)
    document.addEventListener('visibilitychange', resumeIfActive)

    window[MUSIC_STATE_KEY] = state
  }

  const state = window[MUSIC_STATE_KEY]
  if (!state.preloadStarted) {
    state.preloadStarted = true
    state.audio.load()
  }

  return state
}

export function playMusicFromUserGesture() {
  const state = getMusicState()
  syncMusic(state)
  return state.audio.play().catch((error) => {
    if (error?.name !== 'NotAllowedError') {
      console.error('No se pudo iniciar la música del juego:', error)
    }
    throw error
  })
}

export function setGameMusicActive(isActive) {
  const state = getMusicState()
  state.gameActive = Boolean(isActive)
  syncMusic(state, state.gameActive)
}

export function setMusicVolume(volume) {
  const state = getMusicState()
  const parsedVolume = Number(volume)
  state.volume = Number.isFinite(parsedVolume)
    ? Math.min(1, Math.max(0, parsedVolume))
    : DEFAULT_VOLUME
  state.audio.volume = state.volume

  try {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(state.volume))
  } catch {
    // El control sigue funcionando durante esta sesión si el almacenamiento está bloqueado.
  }

  syncMusic(state, state.gameActive)
}

export function getMusicVolume() {
  return getMusicState().volume
}

// Prepara el archivo desde que carga la aplicación para reducir la espera al entrar al nivel.
if (typeof window !== 'undefined') {
  getMusicState()
}
