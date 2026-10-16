<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Phaser from 'phaser'
import Hud from '@/components/HUD.vue'
import SceneFactory from '@/game/factories/SceneFactory.js'
import { useGameStore } from '@/stores/game.js'

let game
let levelScene
const gameStore = useGameStore()

onMounted(() => {
  levelScene = SceneFactory.createLevel2Scene()

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
        debug: false,
      },
    },

    scene: levelScene,
  }

  game = new Phaser.Game(config)
})

onBeforeUnmount(() => {
  if (game) {
    game.destroy(true)
  }
  // Escuchar evento de vidas agotadas
  game.events.on('player-out-of-lives', () => {
    showDeathScreen = true
  })
})

function restartLevel() {
  gameStore.vidas = 5
  gameStore.llaves = 0
  gameStore.enemigos = 0

  // Reinicia la escena Phaser activa; create() vuelve a crear al jugador y el nivel.
  levelScene?.scene.restart()
}
</script>

<template>
  <div class="relative" style="width: 100vw; height: 100vh; overflow: hidden">
    <!-- Phaser -->
    <div id="game-container" style="width: 100%; height: 100%"></div>

    <Hud @retry-level="restartLevel" />
  </div>
</template>
