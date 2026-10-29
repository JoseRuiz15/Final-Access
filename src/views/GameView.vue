<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'
import Hud from '@/components/HUD.vue'
import SceneFactory from '@/game/factories/SceneFactory.js'
import { useCharacterStore } from '@/stores/characters'
import { useGameStore } from '@/stores/game.js'
import { useProfileStore } from '@/stores/profile'
import { useProgressionStore } from '@/stores/progression'
import { getMusicVolume, setMusicVolume } from '@/game/services/GameMusic.js'

let game
let levelScene
let hudResizeObserver
let levelTransitionStarted = false
const gameStore = useGameStore()
const characterStore = useCharacterStore()
const profileStore = useProfileStore()
const progressionStore = useProgressionStore()
const router = useRouter()
const hudRef = ref(null)
const pausaAbierta = ref(false)
const tiempoFinalizado = ref(false)
const volumenMusica = ref(getMusicVolume())
const pauseButtonY = ref(72)
const gameStarted = ref(false)
const assetsReady = ref(false)
const assetsProgress = ref(0)
let isUnmounted = false

watch(volumenMusica, setMusicVolume, { flush: 'sync' })

onMounted(() => {
  initializeGame()
})

async function initializeGame() {
  // Si se abre el juego directamente, recupera del perfil el personaje equipado.
  if (!characterStore.equippedCharacterId && !profileStore.profile?.characterId) {
    try {
      await profileStore.fetchProfile()
    } catch (err) {
      // El juego todavía puede iniciar con la selección guardada localmente.
      console.warn('No se pudo cargar el personaje equipado; se usará la selección guardada.', err)
    }
  }

  if (isUnmounted) return

  const equippedCharacterId =
    characterStore.equippedCharacterId ||
    profileStore.profile?.equippedCharacterId ||
    profileStore.profile?.characterId

  if (equippedCharacterId) {
    characterStore.setEquipped(equippedCharacterId)
    gameStore.equipCharacter(equippedCharacterId)
  }

  // Se crea la escena según el botón de nivel que eligió el usuario.
  const sceneFactories = {
    1: () => SceneFactory.createLevel1Scene(),
    2: () => SceneFactory.createLevel2Scene(),
    3: () => SceneFactory.createLevel3Scene(),
    4: () => SceneFactory.createLevel4Scene(),
  }
  const crearEscena = sceneFactories[Number(gameStore.nivelActual)] ?? sceneFactories[2]
  levelScene = crearEscena()

  // El HUD y el jugador empiezan con las vidas que corresponden a este nivel.
  gameStore.vidas = levelScene.config.vidasIniciales ?? 5
  gameStore.llaves = 0
  gameStore.enemigos = 0

  const config = {
    type: Phaser.AUTO,

    width: 1280,
    height: 720,

    parent: 'game-container',

    pixelArt: true,

    render: {
      antialias: false,
    },

    scale: {
      // El nivel 4 necesita conservar toda su altura en pantallas panorámicas;
      // EXPAND añade vista horizontal en lugar de recortar arriba y abajo.
      mode:
        Number(gameStore.nivelActual) === 4 ? Phaser.Scale.EXPAND : Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 800 },
        debug: true,
        debugShowBody: false,
        debugShowStaticBody: false,
        debugShowVelocity: false,
      },
    },

    scene: levelScene,
  }

  game = new Phaser.Game(config)
  game.events.on('level-completed', handleLevelCompleted)
  game.events.on('level-assets-progress', handleAssetsProgress)
  game.events.once('level-assets-loaded', handleAssetsLoaded)
  window.addEventListener('keydown', handlePauseKey)
  window.addEventListener('resize', updatePauseButtonPosition)
  updatePauseButtonPosition()
  const hudElement = document.querySelector('#game-hud')
  if (hudElement && typeof ResizeObserver !== 'undefined') {
    hudResizeObserver = new ResizeObserver(updatePauseButtonPosition)
    hudResizeObserver.observe(hudElement)
  }
  game.events.once(Phaser.Core.Events.READY, () => {
    enfocarCanvasDelJuego()
    game.canvas?.addEventListener('pointerdown', enfocarCanvasDelJuego)
  })
}

onBeforeUnmount(() => {
  isUnmounted = true
  window.removeEventListener('keydown', handlePauseKey)
  window.removeEventListener('resize', updatePauseButtonPosition)
  hudResizeObserver?.disconnect()
  game?.events.off('level-completed', handleLevelCompleted)
  game?.events.off('level-assets-progress', handleAssetsProgress)
  game?.events.off('level-assets-loaded', handleAssetsLoaded)
  game?.destroy(true)
})

function handleAssetsProgress(progress) {
  assetsProgress.value = Math.max(0, Math.min(1, progress || 0))
}

function handleAssetsLoaded() {
  assetsProgress.value = 1
  assetsReady.value = true
  gameStarted.value = true
}

async function handleLevelCompleted(sceneCompletada, stats) {
  if (levelTransitionStarted || sceneCompletada !== levelScene) return
  levelTransitionStarted = true

  const levelId = Number(gameStore.nivelActual)
  const vidasIniciales = levelScene?.config?.vidasIniciales ?? 5
  const tiempoTranscurrido = Math.max(
    1,
    hudRef.value?.getElapsedSeconds?.() ??
      Math.floor((Date.now() - (sceneCompletada.levelStartTime || Date.now())) / 1000),
  )
  const vidasRestantes = Math.max(0, gameStore.vidas)
  const keyAttempts = Math.max(0, stats?.keyAttempts ?? sceneCompletada.keyAttempts ?? 0)
  const correctKeyFirstTry = stats?.correctKeyFirstTry ?? keyAttempts === 1
  const deaths = Math.max(0, stats?.deaths ?? vidasIniciales - vidasRestantes)
  const kills = Math.max(0, stats?.kills ?? gameStore.enemigos)
  const enemigosTotales = levelScene?.config?.enemies?.length ?? 0
  const tiempoMaximo = levelScene?.config?.hud?.tiempoInicial ?? 0
  const proporcionTiempo = tiempoMaximo > 0
    ? Math.max(0, 1 - tiempoTranscurrido / tiempoMaximo)
    : 0
  const proporcionVidas = vidasIniciales > 0
    ? Math.min(1, vidasRestantes / vidasIniciales)
    : 0
  const proporcionEnemigos = enemigosTotales > 0
    ? Math.min(1, kills / enemigosTotales)
    : 1
  // La rapidez pesa la mitad de la nota; conservar vidas y derrotar enemigos
  // aportan un cuarto cada uno. Completar siempre concede la primera estrella.
  const rendimiento = proporcionTiempo * 50 + proporcionVidas * 25 + proporcionEnemigos * 25
  const stars = 1 + Number(rendimiento >= 40) + Number(rendimiento >= 70)
  const nextLevelId = levelId < 3 ? levelId + 1 : null

  // Prepare level completion data
  const completionData = {
    timeSec: tiempoTranscurrido,
    stars,
    deaths,
    keys: stats?.keys ?? gameStore.llaves,
    kills,
  }

  gameStore.setLevelSummary({
    levelId,
    livesRemaining: vidasRestantes,
    elapsedTimeSec: tiempoTranscurrido,
    kills,
    enemiesTotal: enemigosTotales,
    keyAttempts,
    correctKeyFirstTry,
    stars,
    nextLevelId,
  })

  progressionStore.completeLevel(levelId, completionData).catch((err) => {
    console.error('Error saving progress:', err)
  })
  router.push({ name: 'level-summary' })
}

function restartLevel() {
  pausaAbierta.value = false
  tiempoFinalizado.value = false
  hudRef.value?.resetTimer()
  // Reintentar restaura el nivel activo, sin asumir que todos tienen cinco vidas.
  gameStore.vidas = levelScene?.config.vidasIniciales ?? 5
  gameStore.llaves = 0
  gameStore.enemigos = 0

  // Reinicia la escena Phaser activa; create() vuelve a crear al jugador y el nivel.
  levelScene?.scene.restart()
}

function pauseLevelForTimeout() {
  tiempoFinalizado.value = true
  pausaAbierta.value = false
  levelScene?.scene.pause()
}

function handlePauseKey(event) {
  if (event.code !== 'Escape' || event.repeat || tiempoFinalizado.value) return
  event.preventDefault()
  togglePause()
}

function togglePause() {
  if (!levelScene || tiempoFinalizado.value || gameStore.vidas <= 0) return

  if (pausaAbierta.value) {
    resumeGame()
    return
  }

  levelScene.scene.pause()
  pausaAbierta.value = true
}

function resumeGame() {
  pausaAbierta.value = false
  levelScene?.scene.resume()
  enfocarCanvasDelJuego()
}

function returnToLevelMap() {
  router.push('/levels')
}

function adjustMusicVolume(change) {
  volumenMusica.value = Number(Math.min(1, Math.max(0, volumenMusica.value + change)).toFixed(2))
}

function updatePauseButtonPosition() {
  const hudElement = document.querySelector('#game-hud')
  if (!hudElement) return

  const hudBounds = hudElement.getBoundingClientRect()
  pauseButtonY.value = hudBounds.top + hudBounds.height / 2
}

function soltarLlave() {
  if (gameStore.llaves <= 0) return
  if (levelScene?.player?.soltarLlave()) enfocarCanvasDelJuego()
}

function enfocarCanvasDelJuego() {
  if (!game?.canvas) return

  // Hace el canvas enfocable para que el teclado siga controlando el juego
  // aunque el nivel se haya abierto desde un botón del menú.
  game.canvas.tabIndex = 0
  game.canvas.style.outline = 'none'
  game.canvas.focus({ preventScroll: true })
}
</script>

<template>
  <div class="relative" style="width: 100vw; height: 100vh; overflow: hidden">
    <!-- Phaser -->
    <div id="game-container" style="width: 100%; height: 100%"></div>

    <div
      v-if="!assetsReady"
      class="fixed inset-0 z-20 flex items-center justify-center bg-[#070b19] text-white"
      role="status"
      aria-live="polite"
    >
      <div class="w-[min(82vw,360px)] border border-[#00D9FF]/60 bg-[#07101f]/95 p-6 text-center shadow-[0_0_40px_#00D9FF22]">
        <p class="font-pixel text-xs tracking-[0.2em] text-[#00D9FF]">CARGANDO MISIÓN</p>
        <div class="mt-5 h-2 overflow-hidden bg-white/10">
          <div
            class="h-full bg-[#00D9FF] transition-[width] duration-150"
            :style="{ width: `${Math.round(assetsProgress * 100)}%` }"
          ></div>
        </div>
        <p class="mt-3 font-mono text-xs tabular-nums text-white/65">
          {{ Math.round(assetsProgress * 100) }}%
        </p>
      </div>
    </div>

    <Hud
      ref="hudRef"
      :paused="pausaAbierta"
      :started="gameStarted"
      @retry-level="restartLevel"
      @drop-key="soltarLlave"
      @time-over="pauseLevelForTimeout"
    />

    <button
      v-if="!tiempoFinalizado && gameStore.vidas > 0"
      type="button"
      aria-label="Pausar partida"
      :aria-expanded="pausaAbierta"
      :style="{ top: `${pauseButtonY}px` }"
      class="fixed right-4 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-md border-2 border-[#00D9FF] bg-[#081322]/95 font-pixel text-xl text-[#00D9FF] shadow-[0_0_20px_#00D9FF55] transition hover:bg-[#00D9FF] hover:text-[#050711] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      @click="togglePause"
    >
      {{ pausaAbierta ? '▶' : 'Ⅱ' }}
    </button>

    <div
      v-if="pausaAbierta"
      class="fixed inset-0 z-40 flex items-center justify-center bg-[#02050c]/80 px-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-labelledby="pause-title"
        aria-modal="true"
        class="relative w-full max-w-lg overflow-hidden border border-[#00D9FF]/70 bg-[#07101f] px-7 py-8 text-white shadow-[0_0_60px_#00D9FF33] sm:px-10"
      >
        <div class="pointer-events-none absolute inset-2 border border-[#00D9FF]/15"></div>
        <div class="relative">
          <p class="mb-3 text-center font-pixel text-[9px] tracking-[0.35em] text-[#00D9FF]/70">
            FINAL ACCESS // SESIÓN EN PAUSA
          </p>
          <h1 id="pause-title" class="mb-8 text-center font-pixel text-3xl text-[#00D9FF]">
            PAUSA
          </h1>

          <div class="mb-8 border-y border-white/10 py-5">
            <div class="mb-4 flex items-center justify-between gap-4">
              <label for="music-volume" class="font-pixel text-[10px] text-white/80">
                VOLUMEN DE MÚSICA
              </label>
              <span class="font-pixel text-xs tabular-nums text-[#00D9FF]">
                {{ Math.round(volumenMusica * 100) }}%
              </span>
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                aria-label="Bajar volumen de la música"
                class="h-10 w-10 border border-[#00D9FF]/50 font-pixel text-lg text-[#00D9FF] transition hover:bg-[#00D9FF] hover:text-[#050711] disabled:opacity-40"
                :disabled="volumenMusica <= 0"
                @click="adjustMusicVolume(-0.1)"
              >
                −
              </button>
              <input
                id="music-volume"
                v-model.number="volumenMusica"
                type="range"
                min="0"
                max="1"
                step="0.05"
                aria-label="Volumen de la música"
                class="min-w-0 flex-1 cursor-pointer accent-[#00D9FF]"
              />
              <button
                type="button"
                aria-label="Subir volumen de la música"
                class="h-10 w-10 border border-[#00D9FF]/50 font-pixel text-lg text-[#00D9FF] transition hover:bg-[#00D9FF] hover:text-[#050711] disabled:opacity-40"
                :disabled="volumenMusica >= 1"
                @click="adjustMusicVolume(0.1)"
              >
                +
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button
              type="button"
              class="bg-[#00D9FF] px-5 py-4 font-pixel text-[10px] text-[#050711] transition hover:bg-white hover:shadow-[0_0_24px_#00D9FF66]"
              @click="resumeGame"
            >
              CONTINUAR JUGANDO
            </button>
            <button
              type="button"
              class="border border-[#00D9FF]/60 bg-[#0c1929] px-5 py-4 font-pixel text-[10px] text-[#00D9FF] transition hover:border-[#00D9FF] hover:bg-[#00D9FF]/10"
              @click="restartLevel"
            >
              REINICIAR NIVEL
            </button>
            <button
              type="button"
              class="border border-white/20 px-5 py-4 font-pixel text-[10px] text-white/70 transition hover:border-white/60 hover:text-white"
              @click="returnToLevelMap"
            >
              VOLVER AL MAPA
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
