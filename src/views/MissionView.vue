<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import musicLevel1 from '@/assets/music/musicLevel1.mp3'
import { useGameStore } from '@/stores/game.js'

const router = useRouter()
const gameStore = useGameStore()

const musica = new Audio(musicLevel1)
musica.loop = true
musica.volume = 0.1

const nivelActual = computed(() => Number(gameStore.nivelActual) || 1)

const textoCompleto = computed(() =>
  nivelActual.value === 2
    ? 'Para pasar el nivel necesitas una llave dorada del grupo común, la cual podrás encontrar en cajas que tendrás que destruir. También tendrás que matar a todos los enemigos.'
    : 'Para pasar el nivel necesitas esta llave de plata del grupo común, la cual podrás encontrar en cajas que tendrás que destruir.',
)

const imagenLlave = computed(() =>
  nivelActual.value === 2 ? '/img/keys/Key10-GOLD.png' : '/img/keys/Key1-SILVER.png',
)

const textoMostrado = ref('')

let indice = 0
let intervalo

function escribirTexto() {
  clearInterval(intervalo)
  indice = 0
  textoMostrado.value = ''

  intervalo = setInterval(() => {
    if (indice < textoCompleto.value.length) {
      textoMostrado.value += textoCompleto.value[indice]
      indice++
    } else {
      clearInterval(intervalo)
      intervalo = undefined
    }
  }, 40)
}

function irAlJuego() {
  musica.play()
  router.push('/game')
}

onMounted(() => {
  escribirTexto()
})

watch(nivelActual, escribirTexto)

onUnmounted(() => {
  clearInterval(intervalo)
  musica.pause()
  musica.currentTime = 0
})
</script>

<template>
  <section class="mission-screen fixed inset-0 overflow-hidden">
    <img src="/img/present/loadingscene.png" alt="mission" class="absolute inset-0 w-full h-full object-cover blur-[4px] scale-105" />
    <img
      src="/img/present/tutorialPersonaje.png"
      alt="tutorial"
      class="mission-character absolute top-[460px] left-[650px] w-[500px]"
    />

    <h1 class="mission-title absolute top-[200px] left-[750px] text-[50px] text-white font-pixel text-[30px]">
      NIVEL {{ nivelActual }}
    </h1>

    <div class="mission-dialogue absolute top-[295px] left-[760px] w-[760px] h-[220px]">
      <img
        src="/img/textbox/textbox.png"
        alt=""
        class="absolute inset-0 w-full h-full"
      />

      <div
        :style="
          nivelActual === 2
            ? { left: '60px', right: '90px' }
            : { left: '90px', right: '120px' }
        "
        class="absolute top-4 bottom-6 overflow-y-auto"
      >
        <p
          class="min-h-full -translate-x-2 -translate-y-8 flex items-center justify-center px-4 text-center text-black font-pixel text-[15px] leading-6 break-words"
        >
          <span class="w-full">{{ textoMostrado }}</span>
        </p>
      </div>

      <img :src="imagenLlave" alt="llave" class="absolute right-[52px] top-7 w-[30px] rotate-[20deg]" />
    </div>

    <button
      @click="irAlJuego"
      class="mission-continue absolute bottom-20 right-20 text-white px-10 py-4 rounded-xl font-pixel transition-all duration-300 hover:text-white hover:bg-[#9747FF] hover:shadow-[0_0_25px_#9747FF] hover:scale-105"
    >
      JUGAR
    </button>
  </section>
</template>