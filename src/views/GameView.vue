<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'
import Hud from '@/components/HUD.vue'
import SceneFactory from '@/game/factories/SceneFactory.js'
import { useCharacterStore } from '@/stores/characters'
import { useGameStore } from '@/stores/game.js'
import { useProfileStore } from '@/stores/profile'
import { useProgressionStore } from '@/stores/progression'

let game
let levelScene
let levelTransitionStarted = false
const gameStore = useGameStore()
const characterStore = useCharacterStore()
const profileStore = useProfileStore()
const progressionStore = useProgressionStore()
const router = useRouter()
let isUnmounted = false

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
      mode: Phaser.Scale.ENVELOP,
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
  game.events.once(Phaser.Core.Events.READY, () => {
    enfocarCanvasDelJuego()
    game.canvas?.addEventListener('pointerdown', enfocarCanvasDelJuego)
  })
}

onBeforeUnmount(() => {
  isUnmounted = true
  game?.events.off('level-completed', handleLevelCompleted)
  game?.destroy(true)
})

async function handleLevelCompleted(sceneCompletada, stats) {
  if (levelTransitionStarted || sceneCompletada !== levelScene) return
  levelTransitionStarted = true

  const levelId = Number(gameStore.nivelActual)
  const vidasIniciales = levelScene?.config?.vidasIniciales ?? 5
  const tiempoTranscurrido = Math.floor(
    (Date.now() - (sceneCompletada.levelStartTime || Date.now())) / 1000,
  )

  // Prepare level completion data
  const completionData = {
    timeSec: stats?.timeSec || Math.max(1, tiempoTranscurrido),
    stars: stats?.stars ?? 1,
    deaths: stats?.deaths ?? Math.max(0, vidasIniciales - gameStore.vidas),
    keys: stats?.keys ?? gameStore.llaves,
    kills: stats?.kills ?? gameStore.enemigos,
  }

  // Send to backend
  try {
    await progressionStore.completeLevel(levelId, completionData)
  } catch (err) {
    console.error('Error saving progress:', err)
  }

  // El flujo de misión inicia el siguiente nivel con sus propias vidas y HUD.
  if (levelId === 1 || levelId === 2) {
    gameStore.nivelActual = levelId + 1
    gameStore.llaves = 0
    gameStore.enemigos = 0
    router.push('/mission')
    return
  }

  // El nivel 3 es el último nivel jugable por ahora.
  router.push('/levels')
}

function restartLevel() {
  // Reintentar restaura el nivel activo, sin asumir que todos tienen cinco vidas.
  gameStore.vidas = levelScene?.config.vidasIniciales ?? 5
  gameStore.llaves = 0
  gameStore.enemigos = 0

  // Reinicia la escena Phaser activa; create() vuelve a crear al jugador y el nivel.
  levelScene?.scene.restart()
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

    <Hud @retry-level="restartLevel" @drop-key="soltarLlave" />
  </div>
</template>
