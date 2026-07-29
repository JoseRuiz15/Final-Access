<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Phaser from 'phaser'
import Level1Scene from '@/game/scenes/Level1Scene.js'

let game

onMounted(() => {

    const config = {
        type: Phaser.AUTO,

        width: 1280,
        height: 720,

        parent: 'game-container',

        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 },
                debug: true
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

    <div id="game-container"></div>

</template>