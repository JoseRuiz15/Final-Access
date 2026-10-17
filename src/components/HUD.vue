<script setup>
//aqui empieza el tiempo

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'
import { LEVEL1_CONFIG } from '@/game/configs/level1Config.js'
import { LEVEL2_CONFIG } from '@/game/configs/level2Config.js'

const gameStore = useGameStore()
const router = useRouter()
const nivelActual = computed(() => Number(gameStore.nivelActual) || 1)
const hudConfig = computed(() =>
  nivelActual.value === 1 ? LEVEL1_CONFIG.hud : LEVEL2_CONFIG.hud,
)
const tiempo = ref(hudConfig.value.tiempoInicial)

const tiempoFormateado = computed(() => {
  const minutos = Math.floor(tiempo.value / 60)
  const segundos = tiempo.value % 60

  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
})

let intervalo

function iniciarTemporizador() {
  clearInterval(intervalo)
  intervalo = setInterval(() => {
    if (tiempo.value > 0) {
      tiempo.value--
    } else {
      clearInterval(intervalo)
      intervalo = undefined
      console.log('¡Tiempo terminado!')
    }
  }, 1000)
}

onMounted(() => {
  iniciarTemporizador()
})

onUnmounted(() => {
  clearInterval(intervalo)
})
// aqui termina
//vida

const vidas = computed(() => gameStore.vidas)

//llaves

const llaves = computed(() => gameStore.llaves)

//enemigos

const enemigos = computed(() => gameStore.enemigos)

watch(
  () => hudConfig.value.tiempoInicial,
  (tiempoInicial) => {
    tiempo.value = tiempoInicial
    iniciarTemporizador()
  },
)

const emit = defineEmits(['retry-level', 'drop-key'])

function restartLevel() {
  tiempo.value = hudConfig.value.tiempoInicial
  iniciarTemporizador()
  // GameView tiene acceso a la escena Phaser y ejecutará el reinicio.
  emit('retry-level')
}

function volverASeleccionDeNivel() {
  router.push('/levels')
}
</script>
<template>
  <div
    class="game-hud absolute top-5 left-0 w-full flex justify-center items-center gap-12"
  >
    <div class="relative">
      <img src="/img/hud/hudVidas.png" class="w-64" />
      <!-- Aquí irá la vida -->
      <p
        class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold ml-[-150px] mt-[-50px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]"
      >
        VIDAS
      </p>

      <!-- Corazones -->
      <div class="w-[24px] h-[24px] absolute mt-[-70px] ml-[10px] left-5 flex gap-2">
        <img v-for="vida in vidas" :key="vida" src="/img/level-icons/Heart.png" class="w-6 h-6" />
      </div>
    </div>

    <div class="relative">
      <img src="/img/hud/hudObjetivo.png" class="w-72" />

      <img
        :src="hudConfig.imagenLlave"
        class="absolute w-[18.64px] h-[31.75px] mt-[-70px] ml-[190px] rotate-40"
      />
      <!-- Aquí irá la misión -->
      <p
        class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold ml-[-150px] mt-[-50px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]"
      >
        OBJETIVO
      </p>
      <p
        v-for="(linea, indice) in hudConfig.mision"
        :key="linea"
        class="font-pixel absolute inset-0 flex text-[8px] font-bold ml-[20px] text-white text-shadow-[0_0_40px_#CF56D2]"
        :style="{ marginTop: `${50 + indice * 10}px` }"
      >
        {{ linea }}
      </p>
      <p
        class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold ml-[150px] mt-[-50px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]"
      >
        LLAVES
      </p>
      <p
        class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold ml-[190px] mt-[10px] text-white text-shadow-[0_0_40px_#00D9FF]"
      >
        {{ llaves }}/1
      </p>
      <button
        type="button"
        :disabled="llaves <= 0"
        aria-label="Soltar una llave"
        class="font-pixel absolute top-full left-1/2 z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded border border-[#00D9FF] bg-[#0B1020]/90 px-3 py-2 text-[8px] text-[#00D9FF] transition-colors hover:bg-[#00D9FF] hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        @click.stop="emit('drop-key')"
      >
        SOLTAR LLAVE [K]
      </button>
    </div>

    <div class="relative">
      <img src="/img/hud/hudTiempo.png" class="w-64" />

      <img
        src="/img/level-icons/calavera.png"
        class="absolute w-[30px] h-[13] mt-[-50px] ml-[120px]"
      />
      <!-- Aquí irá el tiempo -->
      <p
        class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold mt-[-80px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]"
      >
        TIEMPO
      </p>
      <p
        class="font-pixel absolute inset-0 flex items-center justify-center text-xl text-white mt-[-20px]"
      >
        {{ tiempoFormateado }}
      </p>

      <p
        class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold mt-[50px] ml-[-120px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]"
      >
        ENEMIGOS
      </p>
      <p
        class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold mt-[50px] ml-[80px] text-white text-shadow-[0_0_40px_#00D9FF]"
      >
        {{ enemigos }}/3
      </p>
    </div>
    <!-- Pantalla de Game Over -->
<div
  v-if="vidas <= 0"
  class="fixed inset-0 z-50 flex items-center justify-center bg-[#050711]/90"
>
  <div
    class="flex flex-col items-center justify-center
           w-[90%] max-w-[650px] min-h-[350px]
           bg-[#0B1020] border-2 border-[#00D9FF]
           rounded-lg px-8 py-10"
  >
    <p class="font-pixel text-[#FF365E] text-4xl mb-4">
      GAME OVER
    </p>

    <p class="font-pixel text-gray-300 text-sm mb-10">
      HAS FALLADO LA MISIÓN
    </p>

    <div class="flex flex-col sm:flex-row gap-5">
      <button
        @click="volverASeleccionDeNivel"
          class="font-pixel text-xs px-6 py-4 w-full sm:w-auto
           bg-[#14182D] text-[#00D9FF]
           border border-[#00D9FF] rounded

           transition-all duration-200 ease-in-out
           hover:scale-105
           hover:bg-[#00D9FF] hover:text-black
           hover:shadow-[0_0_15px_#00D9FF]

           active:scale-95"
      >
           VOLVER AL MAPA
      </button>

      <button
        @click="restartLevel"
          class="font-pixel text-xs px-6 py-4 w-full sm:w-auto
           bg-[#00D9FF] text-black
           border border-[#00D9FF] rounded

           transition-all duration-200 ease-in-out
           hover:scale-105
           hover:bg-white
           hover:shadow-[0_0_15px_#00D9FF]

           active:scale-95"
        >
            REINTENTAR NIVEL
        </button>
    </div>
  </div>
</div>
  </div>
</template>

