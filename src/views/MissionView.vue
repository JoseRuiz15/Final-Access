<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { playMusicFromUserGesture } from '@/game/services/GameMusic.js'
import { useGameStore } from '@/stores/game.js'
import { LEVEL1_CONFIG } from '@/game/configs/level1Config.js'
import { LEVEL2_CONFIG } from '@/game/configs/level2Config.js'
import { LEVEL3_CONFIG } from '@/game/configs/level3Config.js'
import { LEVEL4_CONFIG } from '@/game/configs/level4Config.js'
import { LEVEL5_CONFIG } from '@/game/configs/level5Config.js'

const router = useRouter()
const gameStore = useGameStore()

const nivelActual = computed(() => Number(gameStore.nivelActual) || 1)

const configNivel = computed(() => {
  if (nivelActual.value === 1) return LEVEL1_CONFIG
  if (nivelActual.value === 3) return LEVEL3_CONFIG
  if (nivelActual.value === 4) return LEVEL4_CONFIG
  if (nivelActual.value === 5) return LEVEL5_CONFIG
  return LEVEL2_CONFIG
})

const textoCompleto = computed(() => configNivel.value.hud.pista ?? '')

const textoMostrado = ref('')

let indice = 0
let intervalo

const sonidoEscritura = new Audio('/audio/audioTextMission.mp3')

// El sonido suena en bucle hasta que termina de escribirse la pista.
function iniciarSonidoParrafo() {
  sonidoEscritura.loop = true
  sonidoEscritura.currentTime = 0
  sonidoEscritura.play().catch(() => {})
}

function detenerSonidoParrafo() {
  sonidoEscritura.loop = false
  sonidoEscritura.pause()
  sonidoEscritura.currentTime = 0
}

function escribirTexto() {
  clearInterval(intervalo)
  detenerSonidoParrafo()
  indice = 0
  textoMostrado.value = ''

  iniciarSonidoParrafo()

  intervalo = setInterval(() => {
    if (indice < textoCompleto.value.length) {
      textoMostrado.value += textoCompleto.value[indice]
      indice++
    } else {
      clearInterval(intervalo)
      intervalo = undefined
      detenerSonidoParrafo()
    }
  }, 40)
}

function irAlJuego() {
  detenerSonidoParrafo()
  playMusicFromUserGesture().catch(() => {})
  router.push('/game')
}

onMounted(() => {
  escribirTexto()
})

watch(nivelActual, escribirTexto)

onUnmounted(() => {
  clearInterval(intervalo)
  detenerSonidoParrafo()
})
</script>

<template>
  <section class="mission-screen fixed inset-0 overflow-hidden bg-[#080e20]">
    <img
      src="/img/present/loadingscene.webp"
      alt="mission"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 w-full h-full object-cover blur-[4px] scale-105"
    />
    <img
      src="/img/present/tutorialPersonaje.png"
      alt="tutorial"
      class="mission-character absolute top-[460px] left-[650px] w-[500px]"
    />

    <h1
      class="mission-title absolute top-[200px] left-[750px] text-[50px] text-white font-pixel text-[30px]"
    >
      NIVEL {{ nivelActual }}
    </h1>

    <div class="mission-dialogue absolute top-[295px] left-[760px] w-[760px] h-[220px]">
      <img src="/img/textbox/textbox.png" alt="" class="absolute inset-0 w-full h-full" />

      <div
        :style="
          nivelActual === 2 ? { left: '60px', right: '90px' } : { left: '90px', right: '120px' }
        "
        class="absolute top-4 bottom-6 overflow-y-auto"
      >
        <p
          class="min-h-full -translate-x-2 -translate-y-8 flex items-center justify-center px-4 text-center text-black font-pixel text-[15px] leading-6 break-words"
        >
          <span class="w-full">{{ textoMostrado }}</span>
        </p>
      </div>
    </div>

    <button
      @click="irAlJuego"
      class="mission-continue absolute bottom-20 right-20 text-white px-10 py-4 rounded-xl font-pixel transition-all duration-300 hover:text-white hover:bg-[#9747FF] hover:shadow-[0_0_25px_#9747FF] hover:scale-105"
    >
      JUGAR
    </button>
  </section>
</template>
