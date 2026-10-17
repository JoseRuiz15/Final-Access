<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'
import Hud from '@/components/HUD.vue'
import SceneFactory from '@/game/factories/SceneFactory.js'
import { useGameStore } from '@/stores/game.js'

let game
let levelScene
let levelTransitionStarted = false
const gameStore = useGameStore()
const router = useRouter()

onMounted(() => {
  // Se crea la escena según el botón de nivel que eligió el usuario.
  levelScene =
    Number(gameStore.nivelActual) === 1
      ? SceneFactory.createLevel1Scene()
      : SceneFactory.createLevel2Scene()

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
        // Activa el lienzo de depuración; solo el cuerpo del jugador se dibuja.
        debug: true,
        debugShowBody: false,
        debugShowStaticBody: false,
        debugShowVelocity: false,
      },
    },

    scene: levelScene,
  }

  game = new Phaser.Game(config)
  game.events.on('level-completed', avanzarAlSiguienteNivel)
  game.events.once(Phaser.Core.Events.READY, () => {
    enfocarCanvasDelJuego()
    game.canvas?.addEventListener('pointerdown', enfocarCanvasDelJuego)
  })
})

onBeforeUnmount(() => {
  game?.events.off('level-completed', avanzarAlSiguienteNivel)
  game?.destroy(true)
})

function avanzarAlSiguienteNivel(sceneCompletada) {
  if (levelTransitionStarted || sceneCompletada !== levelScene) return
  levelTransitionStarted = true

  if (Number(gameStore.nivelActual) === 1) {
    // El flujo de misión inicia el nivel 2 con sus propias vidas y su HUD.
    gameStore.nivelActual = 2
    gameStore.llaves = 0
    gameStore.enemigos = 0
    router.push('/mission')
    return
  }

  // Solo hay escenas jugables para los niveles 1 y 2 por ahora.
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
