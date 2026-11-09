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
const matchResult = computed(() => multiplayerStore.matchResult)
const localPlayerWon = computed(
  () => matchResult.value?.winnerId === multiplayerStore.socket?.id,
)
const matchDuration = computed(() => {
  const seconds = Math.max(0, Number(matchResult.value?.durationSeconds) || 0)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
})
const localDeaths = computed(
  () => Number(matchResult.value?.deathsByPlayer?.[multiplayerStore.socket?.id]) || 0,
)
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

watch(matchResult, (result) => {
  if (!result) return
  gameOver.value = false
  isSpectating.value = false
  levelScene?.scene.pause()
})

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
  const localPlayer = multiplayerStore.players.find(
    (player) => player.id === multiplayerStore.socket?.id,
  )
  if (['cosa1', 'cosa2', 'cosa3'].includes(localPlayer?.characterId)) {
    gameStore.equipCharacter(localPlayer.characterId)
  }
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

function returnToLobby() {
  router.replace('/lobby')
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

    <section
      v-if="matchResult"
      class="multiplayer-result-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="multiplayer-result-title"
    >
      <div class="multiplayer-result-panel">
        <p class="multiplayer-result-eyebrow">FINAL ACCESS · RESUMEN MULTIJUGADOR</p>
        <h1
          id="multiplayer-result-title"
          :class="localPlayerWon ? 'is-winner' : 'is-loser'"
        >
          {{ localPlayerWon ? 'YOU WIN' : 'GAME OVER' }}
        </h1>
        <p class="multiplayer-result-message">
          {{ localPlayerWon
            ? 'Abriste primero la puerta con la llave correcta.'
            : `${matchResult.winnerUsername} abrió primero la puerta con la llave correcta.` }}
        </p>

        <dl class="multiplayer-result-stats">
          <div>
            <dt>TIEMPO</dt>
            <dd>{{ matchDuration }}</dd>
          </div>
          <div>
            <dt>ENEMIGOS</dt>
            <dd>{{ matchResult.enemiesDefeated }}</dd>
          </div>
          <div>
            <dt>CAJAS</dt>
            <dd>{{ matchResult.boxesBroken }}</dd>
          </div>
          <div>
            <dt>MUERTES</dt>
            <dd>{{ localDeaths }}</dd>
          </div>
        </dl>

        <div class="multiplayer-result-actions">
          <button type="button" class="result-lobby-button" @click="returnToLobby">
            VOLVER AL LOBBY
          </button>
          <button type="button" class="result-multiplayer-button" @click="exitGame">
            MULTIJUGADOR
          </button>
        </div>
      </div>
    </section>

    <Hud
      v-if="!matchResult"
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

    <header v-if="!matchResult" class="multiplayer-game-header">
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

    <div v-if="isSpectating && !matchResult" class="multiplayer-spectator-banner">
      <span>MODO ESPECTADOR · SIGUIENDO A UN COMPAÑERO</span>
      <button type="button" @click="exitGame">VOLVER AL LOBBY</button>
    </div>

    <p v-if="!isSpectating && !matchResult" class="multiplayer-controls-hint">
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

.multiplayer-result-overlay {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: max(1rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom));
  background:
    linear-gradient(180deg, rgb(4 9 22 / 48%), rgb(2 6 14 / 88%)),
    url('/img/lobby/pantalla_resumen.webp') center / cover,
    #080e20;
}

.multiplayer-result-panel {
  width: min(100%, 680px);
  padding: clamp(1.25rem, 4vw, 2.5rem);
  border: 1px solid rgb(83 244 255 / 55%);
  background: rgb(7 12 32 / 94%);
  box-shadow: 0 0 48px rgb(0 217 255 / 18%), 0 18px 60px rgb(0 0 0 / 45%);
  color: #fff;
  text-align: center;
}

.multiplayer-result-eyebrow {
  color: #d1bcff;
  font-family: 'Press Start 2P', cursive;
  font-size: clamp(7px, 1.6vw, 10px);
  letter-spacing: 0.14em;
  line-height: 1.8;
}

.multiplayer-result-panel h1 {
  margin-top: 1.25rem;
  font-family: 'Press Start 2P', cursive;
  font-size: clamp(1.5rem, 7vw, 3.5rem);
  line-height: 1.4;
  text-shadow: 0 0 24px currentcolor;
}

.multiplayer-result-panel h1.is-winner {
  color: #53f4ff;
}

.multiplayer-result-panel h1.is-loser {
  color: #ff6b9d;
}

.multiplayer-result-message {
  margin: 0.9rem auto 0;
  max-width: 34rem;
  color: rgb(255 255 255 / 78%);
  font-family: 'Press Start 2P', cursive;
  font-size: clamp(8px, 1.7vw, 11px);
  line-height: 2;
}

.multiplayer-result-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin: 1.7rem 0;
}

.multiplayer-result-stats > div {
  padding: 0.9rem 0.5rem;
  border: 1px solid rgb(83 244 255 / 20%);
  background: rgb(255 255 255 / 4%);
}

.multiplayer-result-stats dt {
  color: rgb(209 188 255 / 75%);
  font-family: 'Press Start 2P', cursive;
  font-size: clamp(6px, 1.3vw, 8px);
}

.multiplayer-result-stats dd {
  margin-top: 0.7rem;
  color: #fff;
  font-family: 'Press Start 2P', cursive;
  font-size: clamp(10px, 2vw, 14px);
}

.multiplayer-result-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.multiplayer-result-actions button {
  min-height: 46px;
  padding: 0.75rem 1rem;
  border: 1px solid #53f4ff;
  font-family: 'Press Start 2P', cursive;
  font-size: clamp(7px, 1.5vw, 9px);
  cursor: pointer;
}

.result-lobby-button {
  background: #53f4ff;
  color: #080e20;
}

.result-multiplayer-button {
  background: transparent;
  color: #53f4ff;
}

.multiplayer-result-actions button:hover {
  border-color: #fff;
  filter: brightness(1.15);
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
