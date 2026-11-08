<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'
import Hud from '@/components/HUD.vue'
import SceneFactory from '@/game/factories/SceneFactory.js'
import { useGameStore } from '@/stores/game.js'
import { useMultiplayerStore } from '@/stores/multiplayer'

const router = useRouter()
const gameStore = useGameStore()
const multiplayerStore = useMultiplayerStore()
const previousLevelId = gameStore.nivelActual
const assetsReady = ref(false)
const assetsProgress = ref(0)
const isTouchDevice = ref(false)
const isSpectating = ref(false)
const gameOver = ref(false)

const localLives = computed(() => {
  const localId = multiplayerStore.socket?.id
  const lives = multiplayerStore.levelState.playerLives?.[localId]
  const value = Number(lives)
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 3
})

let game
let levelScene
let isUnmounted = false

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0

  if (
    !multiplayerStore.connected ||
    !multiplayerStore.gameStarted ||
    multiplayerStore.gameMap !== 'level6' ||
    !multiplayerStore.roomCode
  ) {
    router.replace('/multiplayer')
    return
  }

  gameStore.nivelActual = 6
  gameStore.vidas = 3
  gameStore.llaves = 0
  gameStore.llavesCorrectas = 0
  gameStore.enemigos = 0

  levelScene = SceneFactory.createMultiplayerLevel6Scene(multiplayerStore)
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'multiplayer-game-container',
    pixelArt: true,
    render: { antialias: false },
    scale: {
      mode: isTouchDevice.value ? Phaser.Scale.FIT : Phaser.Scale.EXPAND,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 800 },
        debug: false,
      },
    },
    scene: levelScene,
  })

  // Phaser inyecta this.events en la escena al registrarla en el SceneManager,
  // así que hay que suscribirse después de crear el juego.
  levelScene.events.on('game-over', handleGameOver)

  game.events.on('level-assets-progress', handleAssetsProgress)
  game.events.once('level-assets-loaded', handleAssetsLoaded)
  // Phaser puede completar la precarga antes de que estos listeners estén conectados.
  if (levelScene.assetsLoaded) {
    handleAssetsLoaded()
  } else if (levelScene.assetLoadProgress > 0) {
    handleAssetsProgress(levelScene.assetLoadProgress)
  }
  game.events.once(Phaser.Core.Events.READY, () => {
    focusGameCanvas()
    game.canvas?.addEventListener('pointerdown', focusGameCanvas)
  })
})

watch(
  () => multiplayerStore.restartVersion,
  () => resetLevelForRoom(),
)

onBeforeUnmount(() => {
  isUnmounted = true
  levelScene?.events.off('game-over', handleGameOver)
  game?.events.off('level-assets-progress', handleAssetsProgress)
  game?.events.off('level-assets-loaded', handleAssetsLoaded)
  game?.destroy(true)
  multiplayerStore.disconnect()
  gameStore.nivelActual = previousLevelId
})

function handleAssetsProgress(progress) {
  assetsProgress.value = Math.max(0, Math.min(1, progress || 0))
}

function handleAssetsLoaded() {
  if (isUnmounted) return
  assetsProgress.value = 1
  assetsReady.value = true
}

function focusGameCanvas() {
  if (!game?.canvas) return
  game.canvas.tabIndex = 0
  game.canvas.style.outline = 'none'
  game.canvas.focus({ preventScroll: true })
}

function restartLevel() {
  if (multiplayerStore.requestLevelRestart()) return
  resetLevelForRoom()
}

function resetLevelForRoom() {
  isSpectating.value = false
  gameOver.value = false
  gameStore.vidas = levelScene?.config.vidasIniciales ?? 3
  gameStore.llaves = 0
  gameStore.llavesCorrectas = 0
  gameStore.enemigos = 0
  levelScene?.scene.resume()
  levelScene?.scene.restart()
}

function handleGameOver() {
  if (isUnmounted) return
  gameOver.value = true
}

function enterSpectatorMode() {
  if (!levelScene?.enterSpectatorMode?.()) return
  isSpectating.value = true
  gameOver.value = false
  focusGameCanvas()
}

function dropKey() {
  levelScene?.player?.soltarLlave()
  focusGameCanvas()
}

function exitGame() {
  router.replace('/multiplayer')
}

function stopForTimeout() {
  levelScene?.scene.pause()
}
</script>

<template>
  <main class="multiplayer-game-viewport">
    <div id="multiplayer-game-container" class="multiplayer-game-canvas"></div>

    <div
      v-if="!assetsReady"
      class="fixed inset-0 z-20 flex items-center justify-center bg-[#070b19] text-white"
      role="status"
      aria-live="polite"
    >
      <div class="w-[min(82vw,360px)] border border-[#00D9FF]/60 bg-[#07101f]/95 p-6 text-center">
        <p class="font-pixel text-xs tracking-[0.2em] text-[#00D9FF]">CARGANDO PARTIDA</p>
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
      :started="assetsReady"
      :shared-started-at="multiplayerStore.levelState.startedAt"
      :lives="localLives"
      multiplayer
      :spectating="isSpectating"
      :game-over="gameOver"
      @retry-level="restartLevel"
      @drop-key="dropKey"
      @time-over="stopForTimeout"
      @exit-lobby="exitGame"
      @spectate="enterSpectatorMode"
    />

    <header class="multiplayer-game-header">
      <div>
        <p class="multiplayer-room-label">SALA {{ multiplayerStore.roomCode }}</p>
        <p class="multiplayer-player-list">
          {{ multiplayerStore.players.map((player) => player.username).join(' · ') }}
        </p>
      </div>
      <button type="button" class="multiplayer-exit-button" @click="exitGame">
        SALIR DE LA PARTIDA
      </button>
    </header>

    <div v-if="isSpectating" class="multiplayer-spectator-banner">
      <span>MODO ESPECTADOR · SIGUIENDO A UN COMPAÑERO</span>
      <button type="button" @click="exitGame">VOLVER AL LOBBY</button>
    </div>

    <p v-if="!isSpectating" class="multiplayer-controls-hint">
      A/D o ←/→ mover · ESPACIO saltar · L atacar · G interactuar
    </p>
  </main>
</template>

<style scoped>
.multiplayer-game-viewport {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #050711;
}

.multiplayer-game-canvas {
  width: 100%;
  height: 100%;
}

.multiplayer-game-header {
  position: fixed;
  z-index: 30;
  top: max(env(safe-area-inset-top), 1rem);
  left: max(env(safe-area-inset-left), 1rem);
  right: max(env(safe-area-inset-right), 1rem);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  pointer-events: none;
}

.multiplayer-room-label,
.multiplayer-player-list,
.multiplayer-exit-button,
.multiplayer-spectator-banner,
.multiplayer-controls-hint {
  border: 1px solid rgb(83 244 255 / 38%);
  background: rgb(7 16 31 / 88%);
  color: #e9faff;
  font-family: 'Press Start 2P', cursive;
  text-shadow: 0 1px 2px #000;
}

.multiplayer-room-label {
  display: inline-block;
  padding: 0.65rem 0.8rem;
  color: #53f4ff;
  font-size: 9px;
}

.multiplayer-player-list {
  max-width: min(55vw, 520px);
  margin-top: 0.4rem;
  padding: 0.55rem 0.65rem;
  overflow: hidden;
  color: #d1bcff;
  font-size: 7px;
  line-height: 1.8;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multiplayer-exit-button {
  pointer-events: auto;
  padding: 0.75rem 0.9rem;
  color: #ffb2d9;
  font-size: 8px;
  cursor: pointer;
}

.multiplayer-exit-button:hover {
  border-color: #ff00d9;
  color: #fff;
}

.multiplayer-controls-hint {
  position: fixed;
  z-index: 30;
  bottom: max(env(safe-area-inset-bottom), 0.8rem);
  left: 50%;
  width: max-content;
  max-width: calc(100vw - 2rem);
  padding: 0.6rem 0.75rem;
  transform: translateX(-50%);
  color: rgb(255 255 255 / 78%);
  font-size: 7px;
  line-height: 1.8;
  text-align: center;
}

.multiplayer-spectator-banner {
  position: fixed;
  z-index: 30;
  bottom: max(env(safe-area-inset-bottom), 0.8rem);
  left: 50%;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: max-content;
  max-width: calc(100vw - 2rem);
  padding: 0.6rem 0.75rem;
  transform: translateX(-50%);
  color: #53f4ff;
  font-size: 7px;
  line-height: 1.8;
  pointer-events: auto;
}

.multiplayer-spectator-banner button {
  padding: 0.45rem 0.6rem;
  border: 1px solid rgb(255 178 217 / 70%);
  color: #ffb2d9;
  font-family: inherit;
  font-size: 7px;
  cursor: pointer;
}

.multiplayer-spectator-banner button:hover {
  border-color: #ff00d9;
  color: #fff;
}

@media (max-width: 640px) {
  .multiplayer-controls-hint,
  .multiplayer-spectator-banner {
    font-size: 6px;
  }

  .multiplayer-spectator-banner {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .multiplayer-spectator-banner button {
    font-size: 6px;
  }

  .multiplayer-exit-button {
    font-size: 7px;
  }
}
</style>
