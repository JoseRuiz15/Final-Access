<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PixelStar from '@/components/PixelStar.vue'
import { useGameStore } from '@/stores/game.js'

const gameStore = useGameStore()
const router = useRouter()
const summary = computed(() => gameStore.levelSummary)

const formattedTime = computed(() => {
  const seconds = summary.value?.elapsedTimeSec ?? 0
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
})

const keyResult = computed(() => {
  if (!summary.value) return ''
  return summary.value.correctKeyFirstTry
    ? 'LLAVE CORRECTA A LA PRIMERA'
    : `LLAVE CORRECTA AL INTENTO ${summary.value.keyAttempts}`
})

const continueLabel = computed(() =>
  summary.value?.nextLevelId
    ? `CONTINUAR AL NIVEL ${summary.value.nextLevelId}`
    : 'FINALIZAR Y VOLVER AL MAPA',
)

onMounted(() => {
  if (!summary.value) router.replace('/levels')
})

function continueFromSummary() {
  if (!summary.value) return
  const { nextLevelId } = summary.value
  gameStore.clearLevelSummary()

  if (nextLevelId) {
    gameStore.nivelActual = nextLevelId
    gameStore.llaves = 0
    gameStore.enemigos = 0
    router.push('/mission')
    return
  }

  router.push('/levels')
}

function backToLevelMap() {
  gameStore.clearLevelSummary()
  router.push('/levels')
}
</script>

<template>
  <main v-if="summary" class="summary-screen fixed inset-0 overflow-y-auto text-white">
    <div class="summary-scrim absolute inset-0"></div>
    <div class="summary-scanlines pointer-events-none absolute inset-0"></div>

    <div class="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
      <header class="flex items-start justify-between gap-4 border-b border-cyan-200/20 pb-4">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.42em] text-cyan-100/65">
            Final Access <span class="text-fuchsia-300/70">/</span> Archivo de misión
          </p>
          <p class="mt-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
            Registro de salida · Operación completada
          </p>
        </div>
        <div class="border border-cyan-200/35 bg-[#07101f]/70 px-3 py-2 text-right">
          <span class="block font-mono text-[8px] uppercase tracking-[0.24em] text-cyan-100/50">
            Nivel
          </span>
          <span class="font-pixel text-sm text-cyan-100">{{ String(summary.levelId).padStart(2, '0') }}</span>
        </div>
      </header>

      <section class="summary-panel my-auto mx-auto w-full max-w-4xl border border-cyan-100/30 bg-[#07101f]/90 px-5 py-7 shadow-[0_24px_90px_#030610aa] sm:px-10 sm:py-9">
        <div class="mb-7 text-center">
          <p class="mb-3 font-mono text-[9px] uppercase tracking-[0.48em] text-fuchsia-200/80">
            Extracción confirmada
          </p>
          <h1 class="font-pixel text-2xl leading-relaxed text-white drop-shadow-[0_0_18px_#4adfff66] sm:text-4xl">
            MISIÓN COMPLETADA
          </h1>
          <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-50/55">
            Nivel {{ summary.levelId }} · Informe de rendimiento
          </p>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article class="summary-stat border-l-2 border-cyan-300 bg-cyan-950/25 px-4 py-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-100/60">Vidas restantes</p>
            <p class="mt-2 font-pixel text-3xl text-cyan-100">{{ summary.livesRemaining }}</p>
          </article>
          <article class="summary-stat border-l-2 border-fuchsia-300 bg-fuchsia-950/20 px-4 py-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-fuchsia-100/60">Tiempo empleado</p>
            <p class="mt-2 font-mono text-3xl font-semibold tabular-nums text-white">{{ formattedTime }}</p>
          </article>
          <article class="summary-stat border-l-2 border-sky-200 bg-sky-950/25 px-4 py-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-100/60">Enemigos derrotados</p>
            <p class="mt-2 font-pixel text-3xl text-sky-100">
              {{ summary.kills }}<span class="ml-2 font-mono text-sm text-white/45">/ {{ summary.enemiesTotal }}</span>
            </p>
          </article>
        </div>

        <div class="key-result my-4 flex flex-col gap-3 border border-cyan-100/15 bg-[#030915]/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center border border-cyan-100/40 font-pixel text-xl text-cyan-100">⌑</span>
            <div>
              <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">Verificación de llave</p>
              <p class="mt-1 font-pixel text-[10px] leading-5 text-cyan-50 sm:text-xs">{{ keyResult }}</p>
            </div>
          </div>
          <p class="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50 sm:text-right">
            {{ summary.keyAttempts }} {{ summary.keyAttempts === 1 ? 'intento' : 'intentos' }} para abrir la puerta
          </p>
        </div>

        <div class="flex flex-col items-center border-y border-cyan-100/15 py-5 text-center">
          <p class="font-mono text-[9px] uppercase tracking-[0.34em] text-amber-100/65">Calificación final</p>
          <div
            class="my-2 flex items-center gap-3"
            role="img"
            :aria-label="`${summary.stars} de 3 estrellas`"
          >
            <PixelStar
              v-for="star in 3"
              :key="star"
              class="summary-star h-10 w-10 sm:h-12 sm:w-12"
              :active="star <= summary.stars"
              :style="star <= summary.stars ? { animationDelay: `${star * 120}ms` } : undefined"
            />
          </div>
          <p class="font-pixel text-[9px] tracking-[0.18em] text-amber-50/75">
            {{ summary.stars }} / 3 ESTRELLAS
          </p>
          <p class="mt-2 font-mono text-[8px] text-white/35">
            Puntaje: rapidez 50%, vidas restantes 25% y enemigos derrotados 25%. 1 estrella por completar; 2 con 40 puntos y 3 con 70.
          </p>
        </div>

        <footer class="mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <button
            type="button"
            class="border border-white/25 px-5 py-3 font-pixel text-[9px] tracking-[0.08em] text-white/70 transition hover:border-cyan-100/70 hover:text-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100"
            @click="backToLevelMap"
          >
            MAPA DE NIVELES
          </button>
          <button
            type="button"
            class="border border-cyan-100 bg-cyan-100 px-6 py-3 font-pixel text-[9px] tracking-[0.08em] text-[#07101f] shadow-[0_0_24px_#66e6ff44] transition hover:bg-white hover:shadow-[0_0_30px_#66e6ff88] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            @click="continueFromSummary"
          >
            {{ continueLabel }}
          </button>
        </footer>
      </section>

      <p class="mt-5 text-center font-mono text-[8px] uppercase tracking-[0.3em] text-white/30">
        Datos de misión sincronizados con el archivo de progreso
      </p>
    </div>
  </main>
</template>

<style scoped>
.summary-screen {
  background-image: url('/img/lobby/pantalla_resumen.webp');
  background-position: center;
  background-size: cover;
  background-color: #080e20;
}

.summary-scrim {
  background:
    linear-gradient(180deg, rgb(4 9 22 / 45%) 0%, rgb(5 10 24 / 58%) 36%, rgb(2 6 14 / 88%) 100%),
    linear-gradient(90deg, rgb(7 13 31 / 25%), transparent 48%, rgb(7 13 31 / 35%));
}

.summary-scanlines {
  opacity: 0.13;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 3px,
    rgb(178 222 255 / 20%) 4px,
    transparent 5px
  );
}

.summary-panel {
  animation: panel-arrive 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  backdrop-filter: blur(8px);
}

.summary-stat {
  animation: stat-arrive 420ms ease both;
}

.summary-stat:nth-child(2) {
  animation-delay: 80ms;
}

.summary-stat:nth-child(3) {
  animation-delay: 160ms;
}

.summary-star {
  animation: star-light 500ms ease-out both;
  filter: drop-shadow(0 0 12px rgb(255 220 130 / 45%));
}

@keyframes panel-arrive {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes stat-arrive {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes star-light {
  from {
    opacity: 0.15;
    transform: scale(0.65) rotate(-12deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
</style>
