<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Phaser from 'phaser'
import Level1Scene from '@/game/scenes/Level1Scene.js'
import Hud from "@/components/HUD.vue";

let game

onMounted(() => {

    const config = {
        type: Phaser.AUTO,

        width: 1280,
        height: 720,

        parent: 'game-container',

        pixelArt: true,

       render: {
           antialias: false
       },

        scale: {
            mode: Phaser.Scale.ENVELOP,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },

        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 },
                debug: false
            }
        },

        scene: Level1Scene
    }

    game = new Phaser.Game(config)

})

onBeforeUnmount(() => {

    if (game) {
        game.destroy(true)
    }

})
</script>

<template>

  <div
    class="relative"
    style="
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    "
  >

    <!-- Phaser -->
    <div
      id="game-container"
      style="
        width: 100%;
        height: 100%;
      "
    ></div>

    <!-- HUD -->
    <Hud />

  </div>

</template>


<!--
<template>
  <div
    id="game-container"
    style="
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    "
  ></div>
</template>
-->


