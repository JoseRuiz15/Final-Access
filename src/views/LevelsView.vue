<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game.js'
import { useProgressionStore } from '@/stores/progression'

const router = useRouter()
const gameStore = useGameStore()
const progressionStore = useProgressionStore()

const mostrarModalNivel = ref(false)
const nivelSeleccionado = ref(null)
const isLoading = ref(false)

function volverASeleccionarModo() {
  router.push('/gamemode')
}

async function irLoadingScene() {
  if (!nivelSeleccionado.value) return

  const nivel = Number(nivelSeleccionado.value)
  gameStore.nivelActual = nivel

  isLoading.value = true
  try {
    // Check if level is unlocked (completed previous level or is level 1)
    if (nivel > 1 && !progressionStore.isLevelCompleted(nivel - 1)) {
      alert('Completa el nivel anterior para desbloquear este')
      return
    }

    if (nivel === 1 && !gameStore.tutorialNivel1Visto) {
      gameStore.tutorialNivel1Visto = true
      router.push('/loading')
      return
    }

    // Los tres niveles jugables pasan por la pantalla de misión.
    router.push(nivel <= 3 ? '/mission' : '/game')
  } finally {
    isLoading.value = false
  }
}

function seleccionarNivel(nivel) {
  nivelSeleccionado.value = nivel
  mostrarModalNivel.value = true
}

function obtenerDescripcion() {
  switch (nivelSeleccionado.value) {
    case 1:
      return 'En este nivel deberás infiltrarte en la base enemiga y eliminar a todos los guardias, conseguir la llave y llegar a la salida.'
    case 2:
      return 'Debes rescatar a los rehenes antes de que se acabe el tiempo.'
    case 3:
      return 'Consigue la llave plateada Key 13, abre la compuerta al final de la ciudad y escapa.'
    case 4:
      return 'Desactiva la bomba y derrota al jefe final.'
    default:
      return 'Descripción no disponible.'
  }
}

function isLevelUnlocked(level) {
  // Solo existen escenas jugables para los niveles 1, 2 y 3.
  if (level > 3) return false
  if (level === 1) return true
  return progressionStore.isLevelCompleted(level - 1)
}

function getLevelStars(level) {
  return progressionStore.getLevelStars(level)
}

function getBestTime(level) {
  const time = progressionStore.getBestTime(level)
  if (!time) return null
  const mins = Math.floor(time / 60)
  const secs = time % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(async () => {
  await progressionStore.fetchProgress()
})
</script>

<template>
  <section class="fixed inset-0 overflow-hidden bg-[#08071B]">
    <button
      class="absolute top-6 left-6 z-20 text-white font-pixel text-[13px] hover:text-[#FF00D9] hover:text-shadow-[0_0_30px_#FF00D9] transition-all duration-300"
      @click="volverASeleccionarModo"
    >
      &lt;- VOLVER AL MENU
    </button>

    <!-- El mapa ocupa el lienzo completo y los niveles conservan sus posiciones porcentuales. -->
    <div class="absolute inset-0 z-10">
      <div class="relative h-full w-full">
        <img
          src="/img/map/mapa.png"
          alt="Mapa de selección de niveles"
          class="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        />
      <!--Iconos de niveles-->

      <!-- Nivel 1 -->
      <button
        class="absolute top-[39.44%] left-[20.81%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]"
        aria-label="Seleccionar nivel 1"
        @click="seleccionarNivel(1)"
        :disabled="isLoading"
      >
        <img
          src="/img/level-icons/icono_level_1.png"
          alt="nivel 1"
          class="h-full w-full object-contain"
        />
        <!-- Stars indicator -->
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span v-for="i in 3" :key="i" class="text-[10px]" :class="i <= getLevelStars(1) ? 'text-yellow-400' : 'text-gray-500'">★</span>
        </div>
      </button>

      <!-- Nivel 2 -->
      <button
        :class="[
          'absolute top-[45.65%] left-[26.77%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 transition-all duration-300',
          isLevelUnlocked(2) ? 'hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]' : 'opacity-50 cursor-not-allowed'
        ]"
        aria-label="Seleccionar nivel 2"
        @click="seleccionarNivel(2)"
        :disabled="!isLevelUnlocked(2) || isLoading"
      >
        <img
          :src="isLevelUnlocked(2) ? '/img/level-icons/icono_level_2.png' : '/img/level-icons/nivel_bloqueado.png'"
          alt="nivel 2"
          class="h-full w-full object-contain"
        />
        <div v-if="isLevelUnlocked(2)" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span v-for="i in 3" :key="i" class="text-[10px]" :class="i <= getLevelStars(2) ? 'text-yellow-400' : 'text-gray-500'">★</span>
        </div>
      </button>

      <!-- Nivel 3 -->
      <button
        :class="[
          'absolute top-[52.96%] left-[23.39%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 transition-all duration-300',
          isLevelUnlocked(3) ? 'hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]' : 'opacity-50 cursor-not-allowed'
        ]"
        aria-label="Seleccionar nivel 3"
        @click="seleccionarNivel(3)"
        :disabled="!isLevelUnlocked(3) || isLoading"
      >
        <img
          :src="isLevelUnlocked(3) ? '/img/level-icons/icono_level_3.png' : '/img/level-icons/nivel_bloqueado.png'"
          alt="nivel 3"
          class="h-full w-full object-contain"
        />
        <div v-if="isLevelUnlocked(3)" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span v-for="i in 3" :key="i" class="text-[10px]" :class="i <= getLevelStars(3) ? 'text-yellow-400' : 'text-gray-500'">★</span>
        </div>
      </button>

      <!-- Nivel 4 -->
      <button
        :class="[
          'absolute top-[68.43%] left-[30.1%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 transition-all duration-300',
          isLevelUnlocked(4) ? 'hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]' : 'opacity-50 cursor-not-allowed'
        ]"
        aria-label="Seleccionar nivel 4"
        @click="seleccionarNivel(4)"
        :disabled="!isLevelUnlocked(4) || isLoading"
      >
        <img
          :src="isLevelUnlocked(4) ? '/img/level-icons/icono_level_4.png' : '/img/level-icons/nivel_bloqueado.png'"
          alt="nivel 4"
          class="h-full w-full object-contain"
        />
        <div v-if="isLevelUnlocked(4)" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span v-for="i in 3" :key="i" class="text-[10px]" :class="i <= getLevelStars(4) ? 'text-yellow-400' : 'text-gray-500'">★</span>
        </div>
      </button>

      <!-- Nivel 5 -->
      <button
        :class="[
          'absolute top-[50.83%] left-[41.04%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 transition-all duration-300',
          isLevelUnlocked(5) ? 'hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]' : 'opacity-50 cursor-not-allowed'
        ]"
        aria-label="Seleccionar nivel 5"
        @click="seleccionarNivel(5)"
        :disabled="!isLevelUnlocked(5) || isLoading"
      >
        <img
          :src="isLevelUnlocked(5) ? '/img/level-icons/icono_level_5.png' : '/img/level-icons/nivel_bloqueado.png'"
          alt="nivel 5"
          class="h-full w-full object-contain"
        />
        <div v-if="isLevelUnlocked(5)" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span v-for="i in 3" :key="i" class="text-[10px]" :class="i <= getLevelStars(5) ? 'text-yellow-400' : 'text-gray-500'">★</span>
        </div>
      </button>

      <!-- Nivel 6 BLOQUEADO -->
      <button
        class="absolute top-[50.93%] left-[51.72%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 opacity-50 cursor-not-allowed"
        aria-label="Nivel 6 bloqueado"
        disabled
      >
        <img
          src="/img/level-icons/nivel_bloqueado.png"
          alt="nivel 6"
          class="h-full w-full object-contain"
        />
      </button>

      <!-- Nivel 7 BLOQUEADO -->
      <button
        class="absolute top-[57.22%] left-[60.89%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 opacity-50 cursor-not-allowed"
        aria-label="Nivel 7 bloqueado"
        disabled
      >
        <img
          src="/img/level-icons/nivel_bloqueado.png"
          alt="nivel 7"
          class="h-full w-full object-contain"
        />
      </button>

      <!-- Nivel 8 BLOQUEADO -->
      <button
        class="absolute top-[50.93%] left-[69.79%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 opacity-50 cursor-not-allowed"
        aria-label="Nivel 8 bloqueado"
        disabled
      >
        <img
          src="/img/level-icons/nivel_bloqueado.png"
          alt="nivel 8"
          class="h-full w-full object-contain"
        />
      </button>

      <!-- Nivel 9 BLOQUEADO -->
      <button
        class="absolute top-[42.22%] left-[77.71%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 opacity-50 cursor-not-allowed"
        aria-label="Nivel 9 bloqueado"
        disabled
      >
        <img
          src="/img/level-icons/nivel_bloqueado.png"
          alt="nivel 9"
          class="h-full w-full object-contain"
        />
      </button>

      <!-- Nivel 10 BLOQUEADO -->
      <button
        class="absolute top-[54.07%] left-[81.51%] -translate-x-1/2 -translate-y-[90%] origin-[50%_90%] h-[11.111%] w-[6.25%] border-0 bg-transparent p-0 opacity-50 cursor-not-allowed"
        aria-label="Nivel 10 bloqueado"
        disabled
      >
        <img
          src="/img/level-icons/nivel_bloqueado.png"
          alt="nivel 10"
          class="h-full w-full object-contain"
        />
      </button>
      </div>
    </div>
  </section>

  <!--MODAL PARA MOSTRAR INFORMACIÓN DE LOS NIVELES-->
  <div
    v-if="mostrarModalNivel"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
  >
    <div
      class="h-[min(500px,90vh)] w-[min(800px,90vw)] overflow-y-auto rounded-2xl border-4 border-[#585B7A] bg-black/70 p-4 sm:p-8"
    >
      <!-- Título -->
      <h1 class="text-center font-pixel text-2xl text-[#00AAFF] sm:text-3xl">
        NIVEL {{ nivelSeleccionado }}
      </h1>

      <!-- Stars -->
      <div class="text-center my-3">
        <span v-for="i in 3" :key="i" class="text-xl" :class="i <= getLevelStars(nivelSeleccionado) ? 'text-yellow-400' : 'text-gray-500'">★</span>
        <span v-if="getBestTime(nivelSeleccionado)" class="ml-4 text-[#00FFEA] font-pixel text-sm">Mejor tiempo: {{ getBestTime(nivelSeleccionado) }}</span>
      </div>

      <!-- Contenido -->
      <div class="mt-6 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:gap-8">
        <!-- Imagen -->
        <div
          class="h-[180px] w-full shrink-0 overflow-hidden rounded-lg border-2 border-[#585B7A] sm:h-[250px] sm:w-[300px]"
        >
          <img
            :src="`/img/referencia-mapas/MAPA_${nivelSeleccionado}.png`"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Descripción -->
        <div class="flex-1">
          <h2 class="font-pixel text-white text-xl">DESCRIPCIÓN</h2>

          <p class="text-white mt-6 leading-7 font-pixel text-sm">
            {{ obtenerDescripcion() }}
          </p>

          <div v-if="progressionStore.isLevelCompleted(nivelSeleccionado)" class="mt-4 p-3 bg-green-900/30 border border-green-500 rounded-lg">
            <p class="font-pixel text-green-300 text-sm">✓ Nivel completado</p>
            <p class="font-pixel text-green-400 text-xs mt-1">Estrellas: {{ getLevelStars(nivelSeleccionado) }}/3</p>
            <p v-if="getBestTime(nivelSeleccionado)" class="font-pixel text-green-400 text-xs">Mejor tiempo: {{ getBestTime(nivelSeleccionado) }}</p>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="mt-6 flex flex-col justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-10">
        <button
          @click="irLoadingScene"
          :disabled="!isLevelUnlocked(nivelSeleccionado) || isLoading"
          class="h-14 w-full rounded-xl border-2 border-cyan-400 bg-[#00AAFF] font-pixel transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-[0_0_20px_#00AAFF] sm:w-[220px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:border-gray-500"
        >
          {{ isLevelUnlocked(nivelSeleccionado) ? 'JUGAR' : 'NIVEL BLOQUEADO' }}
        </button>

        <button
          @click="mostrarModalNivel = false"
          class="h-14 w-full rounded-xl border-2 border-gray-500 bg-[#2B2E46] font-pixel text-white transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-[0_0_20px_#00AAFF] sm:w-[220px]"
        >
          CERRAR
        </button>
      </div>
    </div>
  </div>
</template>