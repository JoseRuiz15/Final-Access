<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PixelStar from '@/components/PixelStar.vue'
import { useGameStore } from '@/stores/game.js'

const gameStore = useGameStore()
const router = useRouter()
const summary = computed(() => gameStore.levelSummary)
let winAudio = null

const formattedTime = computed(() => {
  const seconds = summary.value?.elapsedTimeSec ?? 0
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
})

const keyResult = computed(() => {
  if (!summary.value) return ''
  if (summary.value.keyAttempts === 0) return 'PUERTA ABIERTA SIN LLAVE'
  const etiqueta = (summary.value.correctKeys ?? 1) > 1 ? 'LLAVES CORRECTAS' : 'LLAVE CORRECTA'
  return summary.value.correctKeyFirstTry
    ? `${etiqueta} A LA PRIMERA`
    : `${etiqueta} AL INTENTO ${summary.value.keyAttempts}`
})

const continueLabel = computed(() =>
  summary.value?.nextLevelId
    ? `CONTINUAR AL NIVEL ${summary.value.nextLevelId}`
    : 'FINALIZAR Y VOLVER AL MAPA',
)

onMounted(() => {
  if (!summary.value) {
    router.replace('/levels')
    return
  }

  winAudio = new Audio('/soundEffects/Jugador/win.mp3')
  winAudio.volume = 0.7
  winAudio.play().catch((error) => {
    if (error?.name !== 'NotAllowedError') {
      console.warn('No se pudo reproducir el sonido de victoria:', error)
    }
  })
})

onBeforeUnmount(() => {
  winAudio?.pause()
  winAudio = null
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

    <div
      class="summary-content relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8"
    >
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
          <span class="font-pixel text-sm text-cyan-100">{{
            String(summary.levelId).padStart(2, '0')
          }}</span>
        </div>
      </header>

      <section
        class="summary-panel my-auto mx-auto w-full max-w-4xl border border-cyan-100/30 bg-[#07101f]/90 px-5 py-7 shadow-[0_24px_90px_#030610aa] sm:px-10 sm:py-9"
      >
        <div class="summary-heading mb-7 text-center">
          <p class="mb-3 font-mono text-[9px] uppercase tracking-[0.48em] text-fuchsia-200/80">
            Extracción confirmada
          </p>
          <h1
            class="font-pixel text-2xl leading-relaxed text-white drop-shadow-[0_0_18px_#4adfff66] sm:text-4xl"
          >
            MISIÓN COMPLETADA
          </h1>
          <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-50/55">
            Nivel {{ summary.levelId }} · Informe de rendimiento
          </p>
        </div>

        <div
          v-if="summary.dashUnlocked && summary.levelId === 3"
          class="mb-6 border border-emerald-300/50 bg-emerald-950/40 px-4 py-3 text-center shadow-[0_0_24px_#34d39922]"
          role="status"
        >
          <p class="font-pixel text-xs leading-relaxed text-emerald-200 sm:text-sm">
            ¡FELICIDADES! DASH DESBLOQUEADO
          </p>
          <p class="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-100/65">
            Ya pueden usarlo todos los personajes con doble toque izquierda o derecha
          </p>
        </div>

        <div class="summary-stats grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article class="summary-stat border-l-2 border-cyan-300 bg-cyan-950/25 px-4 py-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-100/60">
              Vidas restantes
            </p>
            <p class="mt-2 font-pixel text-3xl text-cyan-100">{{ summary.livesRemaining }}</p>
          </article>
          <article class="summary-stat border-l-2 border-fuchsia-300 bg-fuchsia-950/20 px-4 py-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-fuchsia-100/60">
              Tiempo empleado
            </p>
            <p class="mt-2 font-mono text-3xl font-semibold tabular-nums text-white">
              {{ formattedTime }}
            </p>
          </article>
          <article class="summary-stat border-l-2 border-sky-200 bg-sky-950/25 px-4 py-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-100/60">
              Enemigos derrotados
            </p>
            <p class="mt-2 font-pixel text-3xl text-sky-100">
              {{ summary.kills
              }}<span class="ml-2 font-mono text-sm text-white/45"
                >/ {{ summary.enemiesTotal }}</span
              >
            </p>
          </article>
        </div>

        <div
          class="key-result my-4 flex flex-col gap-3 border border-cyan-100/15 bg-[#030915]/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <div class="flex items-center gap-3">
            <span
              class="grid h-10 w-10 shrink-0 place-items-center border border-cyan-100/40 font-pixel text-xl text-cyan-100"
              >⌑</span
            >
            <div>
              <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
                Verificación de llave
              </p>
              <p class="mt-1 font-pixel text-[10px] leading-5 text-cyan-50 sm:text-xs">
                {{ keyResult }}
              </p>
            </div>
          </div>
          <p class="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50 sm:text-right">
            {{ summary.keyAttempts }} {{ summary.keyAttempts === 1 ? 'intento' : 'intentos' }} para
            abrir la puerta
          </p>
        </div>

        <div
          class="summary-rating flex flex-col items-center border-y border-cyan-100/15 py-5 text-center"
        >
          <p class="font-mono text-[9px] uppercase tracking-[0.34em] text-amber-100/65">
            Calificación final
          </p>
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
            Puntaje: rapidez 50%, vidas restantes 25% y enemigos derrotados 25%. 1 estrella por
            completar; 2 con 40 puntos y 3 con 70.
          </p>
        </div>

        <section
          class="summary-rewards my-4 border border-amber-200/25 bg-amber-950/20 px-4 py-4 sm:px-6"
          aria-live="polite"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-100/65">
                Monedas obtenidas
              </p>
              <p class="mt-2 font-pixel text-2xl text-amber-100">
                {{ summary.coinsSaved === false ? '—' : `+${summary.coinGain ?? '...'}` }}
              </p>
            </div>
            <p
              v-if="summary.coinsBalance !== undefined"
              class="font-mono text-[10px] text-white/60"
            >
              {{ summary.coinsSavedLocally ? 'Saldo guardado en este dispositivo:' : 'Saldo guardado:' }}
              {{ summary.coinsBalance }}
            </p>
            <p v-else-if="summary.coinsSaved === false" class="font-mono text-[9px] text-rose-200">
              No se pudo confirmar el guardado. Revisa tu conexión.
            </p>
            <p v-else class="font-mono text-[9px] text-white/45">Guardando recompensa...</p>
          </div>
          <div
            v-if="summary.coinBreakdown"
            class="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 border-t border-amber-100/10 pt-3 font-mono text-[9px] text-white/55 sm:grid-cols-5"
          >
            <span>Completar +{{ summary.coinBreakdown.completion }}</span>
            <span>Estrellas +{{ summary.coinBreakdown.stars }}</span>
            <span>Rapidez +{{ summary.coinBreakdown.speed }}</span>
            <span>Enemigos +{{ summary.coinBreakdown.enemies }}</span>
            <span>Llaves correctas +{{ summary.coinBreakdown.correctKeys }}</span>
          </div>
        </section>

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

/* Mantiene el resumen completo y desplazable en ventanas bajas o estrechas. */
.summary-screen {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.summary-screen > .summary-scrim,
.summary-screen > .summary-scanlines {
  position: fixed !important;
  inset: 0;
  height: 100dvh !important;
  overflow: hidden !important;
}

.summary-screen .summary-content {
  display: flex;
  width: min(100%, 1200px);
  max-width: 1200px;
  min-height: 100vh;
  min-height: 100dvh;
  height: auto !important;
  flex-direction: column;
  justify-content: flex-start;
  padding: clamp(12px, 3vw, 36px) clamp(12px, 3.5vw, 40px) !important;
  overflow: visible !important;
}

.summary-content > header {
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  padding-bottom: clamp(8px, 1.5vh, 16px);
}

.summary-content > header > div:first-child {
  min-width: 0;
}

.summary-content > header p:first-child {
  font-size: clamp(8px, 0.8vw, 10px) !important;
  line-height: 1.6;
  letter-spacing: clamp(0.08em, 0.3vw, 0.42em) !important;
}

.summary-content > header p:last-child {
  font-size: clamp(8px, 0.7vw, 9px) !important;
  line-height: 1.6;
}

.summary-screen .summary-panel {
  width: min(100%, 920px);
  max-width: 920px;
  min-width: 0;
  height: auto !important;
  min-height: 0;
  flex: 0 0 auto;
  margin: clamp(12px, 3vh, 28px) auto 0 !important;
  padding: clamp(14px, 3vw, 36px) !important;
  overflow: visible !important;
}

.summary-heading {
  margin-bottom: clamp(12px, 2vh, 24px) !important;
}

.summary-heading > p:first-child {
  font-size: clamp(8px, 0.9vw, 10px) !important;
  line-height: 1.6;
  letter-spacing: clamp(0.12em, 0.35vw, 0.48em) !important;
}

.summary-heading > h1 {
  font-size: clamp(16px, 2.7vw, 36px) !important;
  line-height: 1.6 !important;
  overflow-wrap: anywhere;
}

.summary-heading > p:last-child {
  font-size: clamp(8px, 0.85vw, 10px) !important;
  line-height: 1.6;
}

.summary-screen .summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)) !important;
  gap: clamp(8px, 1.2vw, 14px);
}

.summary-screen .summary-stat {
  min-width: 0;
  padding: clamp(10px, 1.3vw, 16px) !important;
}

.summary-screen .summary-stat p:first-child {
  font-size: clamp(8px, 0.75vw, 10px) !important;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.summary-screen .summary-stat p:last-child {
  margin-top: 6px !important;
  font-size: clamp(18px, 2.5vw, 32px) !important;
  line-height: 1.35;
}

.summary-screen .summary-stat p:last-child span {
  font-size: clamp(9px, 1vw, 14px) !important;
}

.summary-screen .key-result {
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(8px, 1.5vw, 18px);
  margin-block: clamp(10px, 1.5vh, 16px) !important;
  padding: clamp(10px, 1.5vw, 18px) !important;
}

.summary-screen .key-result > div {
  min-width: 0;
}

.summary-screen .key-result p {
  font-size: clamp(8px, 0.8vw, 10px) !important;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.summary-screen .key-result > div > p:last-child {
  font-size: clamp(9px, 0.9vw, 12px) !important;
}

.summary-screen .summary-rating {
  padding-block: clamp(10px, 2vh, 20px) !important;
}

.summary-screen .summary-rating > p {
  font-size: clamp(8px, 0.8vw, 10px) !important;
  line-height: 1.6;
}

.summary-screen .summary-rating > p:last-child {
  font-size: clamp(8px, 0.8vw, 10px) !important;
}

.summary-screen .summary-star {
  width: clamp(24px, 4vw, 44px) !important;
  height: clamp(24px, 4vw, 44px) !important;
}

.summary-screen .summary-rewards {
  margin-block: clamp(10px, 1.5vh, 16px) !important;
  padding: clamp(10px, 1.5vw, 18px) !important;
}

.summary-screen .summary-rewards p,
.summary-screen .summary-rewards span {
  font-size: clamp(8px, 0.8vw, 10px) !important;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.summary-screen .summary-rewards p.font-pixel {
  font-size: clamp(16px, 2vw, 24px) !important;
}

.summary-screen footer {
  flex-wrap: wrap;
  margin-top: clamp(12px, 2vh, 24px) !important;
  gap: 10px;
}

.summary-screen footer button {
  min-height: 42px;
  max-width: 100%;
  padding: clamp(10px, 1vw, 14px) clamp(12px, 1.8vw, 22px) !important;
  font-size: clamp(8px, 0.85vw, 10px) !important;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.summary-content > p:last-child {
  margin-top: clamp(10px, 1.5vh, 16px) !important;
  font-size: clamp(7px, 0.7vw, 8px) !important;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .summary-screen {
    height: 100dvh !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }

  .summary-screen .summary-content {
    width: 100% !important;
    height: auto !important;
    min-height: 100dvh !important;
    padding: 6px clamp(6px, 2vw, 10px) !important;
    overflow: visible !important;
  }

  .summary-screen .summary-panel {
    width: 100% !important;
    max-width: 560px !important;
    height: auto !important;
    min-height: 0 !important;
    flex: 0 0 auto !important;
    margin: 6px auto !important;
    padding: clamp(7px, 2.5vw, 12px) !important;
    overflow: visible !important;
  }

  .summary-screen .summary-heading h1 {
    font-size: clamp(10px, 3vw, 16px) !important;
    line-height: 1.35 !important;
    overflow-wrap: anywhere;
  }

  .summary-screen .summary-heading > p,
  .summary-screen .summary-stat p,
  .summary-screen .key-result p,
  .summary-screen .summary-panel > section p,
  .summary-screen .summary-panel > section span {
    overflow-wrap: anywhere;
  }

  .summary-screen .summary-stat {
    padding: clamp(5px, 1.5vw, 8px) !important;
  }

  .summary-screen .summary-stat p:first-child {
    font-size: clamp(5px, 1.6vw, 7px) !important;
  }

  .summary-screen .summary-stat p:last-child {
    font-size: clamp(10px, 3vw, 16px) !important;
  }

  .summary-screen .summary-panel footer {
    flex-direction: column-reverse !important;
  }

  .summary-screen .summary-panel footer button {
    width: 100% !important;
    min-height: 30px;
    padding: 6px !important;
    font-size: clamp(5px, 1.6vw, 7px) !important;
  }

  .summary-content > header p:first-child {
    max-width: calc(100vw - 88px);
    letter-spacing: 0.12em !important;
  }

  .summary-screen .summary-panel {
    margin-top: 10px !important;
  }

  .summary-screen .summary-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .summary-screen .summary-stat:last-child {
    grid-column: 1 / -1;
  }

  .summary-screen .key-result {
    align-items: flex-start;
  }

  .summary-screen .summary-rewards > div:first-child {
    gap: 8px;
  }

  .summary-screen .summary-rewards > div:last-child {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 6px 10px;
  }

  .summary-screen footer {
    flex-direction: column-reverse;
  }

  .summary-screen footer button {
    width: 100%;
  }
}

@media (max-height: 620px) {
  .summary-screen .summary-content {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }

  .summary-screen .summary-panel {
    margin-top: 8px !important;
    padding-block: clamp(10px, 2vh, 18px) !important;
  }

  .summary-heading {
    margin-bottom: 10px !important;
  }

  .summary-screen .key-result {
    margin-block: 8px !important;
    padding-block: 8px !important;
  }

  .summary-screen .summary-rating {
    padding-block: 8px !important;
  }

  .summary-screen footer {
    margin-top: 10px !important;
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
