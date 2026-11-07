<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isTouchDevice = ref(false)
const isPortrait = ref(false)
const orientationMessage = ref('')
const showLandscapeGate = computed(
  () => isTouchDevice.value && isPortrait.value && route.name !== 'codeverification',
)

let orientationQuery

watch(
  () => route.name,
  (routeName) => {
    if (routeName !== 'codeverification') return
    try {
      window.screen.orientation?.unlock?.()
    } catch {
      // iOS Safari puede no implementar el desbloqueo de orientación.
    }
    refreshOrientation()
  },
)

function refreshOrientation() {
  isPortrait.value = window.matchMedia('(orientation: portrait)').matches
  if (!isPortrait.value) orientationMessage.value = ''
}

async function tryAutomaticLandscapeLock() {
  try {
    await window.screen.orientation?.lock?.('landscape')
  } catch {
    // Los navegadores suelen reservar el bloqueo para apps instaladas o pantalla completa.
  }
  refreshOrientation()
}

async function activateLandscapeMode() {
  orientationMessage.value = ''

  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    }
  } catch {
    // Safari y algunos navegadores no permiten pantalla completa desde una página web.
  }

  try {
    await window.screen.orientation?.lock?.('landscape')
  } catch {
    orientationMessage.value =
      'Gira el teléfono. Para ocultar la barra de Safari, abre Final Access desde la pantalla de inicio.'
  }

  refreshOrientation()
  if (isPortrait.value && !orientationMessage.value) {
    orientationMessage.value =
      'Gira el teléfono. Para ocultar la barra de Safari, abre Final Access desde la pantalla de inicio.'
  }
}

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0
  orientationQuery = window.matchMedia('(orientation: portrait)')
  refreshOrientation()
  orientationQuery.addEventListener?.('change', refreshOrientation)
  window.addEventListener('resize', refreshOrientation)
  window.screen.orientation?.addEventListener?.('change', refreshOrientation)

  if (isTouchDevice.value && isPortrait.value && route.name !== 'codeverification') {
    tryAutomaticLandscapeLock()
  }
})

onBeforeUnmount(() => {
  orientationQuery?.removeEventListener?.('change', refreshOrientation)
  window.removeEventListener('resize', refreshOrientation)
  window.screen.orientation?.removeEventListener?.('change', refreshOrientation)
})
</script>

<template>
  <RouterView />

  <Transition name="orientation-gate">
    <div
      v-if="showLandscapeGate"
      class="orientation-gate fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center px-6 py-8 text-center text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orientation-title"
    >
      <div class="orientation-grid pointer-events-none absolute inset-0"></div>
      <section
        class="orientation-panel relative w-full max-w-md border border-cyan-300/45 bg-[#07101f]/95 px-6 py-10 shadow-[0_0_60px_#00d9ff22] sm:px-10"
      >
        <div
          class="orientation-icon mx-auto mb-7 grid h-20 w-20 place-items-center border border-cyan-200/50 bg-cyan-300/5 text-cyan-200"
        >
          <svg viewBox="0 0 64 64" class="h-12 w-12" fill="none" aria-hidden="true">
            <rect
              x="20"
              y="8"
              width="24"
              height="48"
              rx="4"
              stroke="currentColor"
              stroke-width="3"
            />
            <path
              d="M27 48h10M10 27a22 22 0 0 1 36-15M46 12V4m0 8h-8M54 37a22 22 0 0 1-36 15m0 0v8m0-8h8"
              stroke="#ff4de1"
              stroke-width="3"
              stroke-linecap="square"
            />
          </svg>
        </div>
        <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-200/65">
          FINAL ACCESS / MODO MÓVIL
        </p>
        <h1 id="orientation-title" class="font-pixel text-lg leading-loose text-white sm:text-xl">
          GIRA TU DISPOSITIVO
        </h1>
        <p class="mx-auto mt-4 max-w-sm font-mono text-sm leading-6 text-slate-300">
          El juego se disfruta mejor con la pantalla en horizontal y a pantalla completa.
        </p>
        <button
          type="button"
          class="mt-8 min-h-14 w-full border border-cyan-200 bg-cyan-200 px-5 py-4 font-pixel text-[10px] leading-relaxed text-[#07101f] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          @click="activateLandscapeMode"
        >
          ACTIVAR MODO HORIZONTAL
        </button>
        <p class="mt-5 min-h-10 font-mono text-xs leading-5 text-fuchsia-200/90" aria-live="polite">
          {{ orientationMessage || 'Si no gira automáticamente, gira el teléfono o la tablet.' }}
        </p>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.orientation-gate {
  background: radial-gradient(ellipse at 50% 38%, rgb(0 217 255 / 12%), transparent 48%), #030711;
  padding-top: max(24px, env(safe-area-inset-top));
  padding-right: max(24px, env(safe-area-inset-right));
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  padding-left: max(24px, env(safe-area-inset-left));
}

.orientation-grid {
  opacity: 0.14;
  background-image:
    linear-gradient(rgb(72 211 255 / 15%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(72 211 255 / 15%) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(transparent, black 25%, black 75%, transparent);
}

.orientation-panel {
  backdrop-filter: blur(12px);
}

.orientation-icon {
  animation: turn-device 3.5s ease-in-out infinite;
}

.orientation-gate-enter-active,
.orientation-gate-leave-active {
  transition: opacity 180ms ease;
}

.orientation-gate-enter-from,
.orientation-gate-leave-to {
  opacity: 0;
}

@keyframes turn-device {
  0%,
  20% {
    transform: rotate(0deg);
  }
  52%,
  78% {
    transform: rotate(90deg);
  }
  100% {
    transform: rotate(90deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orientation-icon {
    animation: none;
  }
}
</style>
