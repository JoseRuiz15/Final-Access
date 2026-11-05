<script setup>
import { computed } from 'vue'
import { getLobbyCharacter, getLobbyStageWidth } from '@/game/configs/lobbyCharacters'

const props = defineProps({
  characterId: {
    type: String,
    default: 'cosa1',
  },
  // Altura del retrato en píxeles; el ancho sale de la proporción de cada PNG.
  height: {
    type: Number,
    default: 430,
  },
})

const character = computed(() => getLobbyCharacter(props.characterId))

const portraitHeight = computed(() => Math.round(props.height * character.value.lobbyScale))

const portraitWidth = computed(() =>
  Math.round((portraitHeight.value * character.value.imageWidth) / character.value.imageHeight),
)

// La base es igual para los tres personajes para que el aro mida lo mismo.
const stageWidth = computed(() => getLobbyStageWidth(props.height))

// El aro se ancla al 3% inferior; los pies se alinean con su centro.
const ringBottom = computed(() => props.height * 0.03)
const portraitBottom = computed(() =>
  Math.round(ringBottom.value - character.value.feetPadding * portraitHeight.value),
)

const stageStyle = computed(() => ({
  '--ring-color': character.value.ringColor,
  width: `${stageWidth.value}px`,
  height: `${props.height}px`,
}))

const portraitStyle = computed(() => ({
  width: `${portraitWidth.value}px`,
  height: `${portraitHeight.value}px`,
  '--portrait-bottom': `${portraitBottom.value}px`,
}))

const characterLabel = computed(() => `${character.value.name} equipado`)

const particleSeeds = [
  { position: -0.94, size: 6, delay: '0s', duration: '4.6s' },
  { position: -0.7, size: 5, delay: '1.1s', duration: '5.2s' },
  { position: -0.46, size: 7, delay: '2.3s', duration: '4.1s' },
  { position: -0.22, size: 5, delay: '0.5s', duration: '4.9s' },
  { position: 0, size: 6, delay: '1.7s', duration: '4.4s' },
  { position: 0.22, size: 5, delay: '3.1s', duration: '5s' },
  { position: 0.46, size: 7, delay: '0.8s', duration: '4.2s' },
  { position: 0.7, size: 5, delay: '2s', duration: '5.1s' },
  { position: 0.94, size: 6, delay: '3.6s', duration: '4.7s' },
]

// Las partículas nacen sobre el aro y se abren hacia afuera al subir.
const particles = computed(() => {
  const radius = stageWidth.value * 0.42

  return particleSeeds.map((particle) => {
    const startX = Math.round(particle.position * radius)

    return {
      ...particle,
      key: `${particle.position}-${particle.delay}`,
      startX,
      endX: Math.round(startX * 1.8),
    }
  })
})
</script>

<template>
  <div class="character-showcase" :style="stageStyle">
    <div class="showcase-backdrop" aria-hidden="true"></div>
    <div class="showcase-beam" aria-hidden="true"></div>
    <div class="showcase-shadow" aria-hidden="true"></div>

    <div class="showcase-ring-wrap" aria-hidden="true">
      <svg class="showcase-ring" viewBox="0 0 300 80">
        <ellipse class="ring-glow" cx="150" cy="40" rx="140" ry="30" />
        <ellipse class="ring-rim" cx="150" cy="40" rx="140" ry="30" />
        <ellipse class="ring-inner" cx="150" cy="40" rx="120" ry="22" />
        <ellipse class="ring-dash" cx="150" cy="40" rx="130" ry="26" />
      </svg>
    </div>

    <span
      v-for="particle in particles"
      :key="particle.key"
      class="showcase-particle"
      :style="{
        '--start-x': `${particle.startX}px`,
        '--end-x': `${particle.endX}px`,
        '--particle-size': `${particle.size}px`,
        animationDelay: particle.delay,
        animationDuration: particle.duration,
      }"
      aria-hidden="true"
    ></span>

    <div class="showcase-portrait-wrap" :style="portraitStyle">
      <img
        class="showcase-portrait"
        :src="character.lobbyImage"
        :alt="characterLabel"
        decoding="async"
        fetchpriority="high"
        draggable="false"
      />
    </div>
  </div>
</template>

<style scoped>
.character-showcase {
  position: relative;
  flex: 0 0 auto;
  pointer-events: none;
  user-select: none;
}

.showcase-backdrop {
  position: absolute;
  inset: -12% -6%;
  z-index: 0;
  background: radial-gradient(
    circle at 50% 55%,
    rgb(2 5 16 / 78%) 0%,
    rgb(2 5 16 / 42%) 45%,
    transparent 72%
  );
}

.showcase-beam {
  position: absolute;
  left: 50%;
  bottom: 2%;
  z-index: 1;
  width: 106%;
  height: 100%;
  transform: translateX(-50%);
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--ring-color) 34%, transparent),
    transparent 84%
  );
  /* Base del ancho del aro y se abre hacia afuera al subir. */
  clip-path: polygon(10% 100%, 90% 100%, 100% 0, 0 0);
  filter: blur(20px);
  opacity: 0.85;
}

.showcase-shadow {
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 1;
  width: 62%;
  height: 12%;
  transform: translate(-50%, 50%);
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgb(0 0 0 / 72%), transparent 70%);
  filter: blur(7px);
}

.showcase-ring-wrap {
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 2;
  width: 90%;
  transform: translate(-50%, 50%);
  animation: showcase-ring-pulse 2.6s ease-in-out infinite;
}

.showcase-ring {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.ring-glow {
  fill: none;
  stroke: var(--ring-color);
  stroke-width: 12;
  opacity: 0.42;
  filter: blur(5px);
}

.ring-rim {
  fill: none;
  stroke: var(--ring-color);
  stroke-width: 2.4;
  filter: drop-shadow(0 0 6px var(--ring-color));
}

.ring-inner {
  fill: none;
  stroke: #ffffff;
  stroke-width: 1.8;
  opacity: 0.9;
  filter: drop-shadow(0 0 6px rgb(255 255 255 / 90%));
}

.ring-dash {
  fill: none;
  stroke: #ffffff;
  stroke-width: 1.6;
  stroke-dasharray: 9 11;
  opacity: 0.9;
  animation: showcase-ring-dash 14s linear infinite;
}

.showcase-portrait-wrap {
  position: absolute;
  left: 50%;
  bottom: var(--portrait-bottom);
  z-index: 3;
  transform: translateX(-50%);
}

.showcase-portrait {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
  image-rendering: auto;
  filter: drop-shadow(0 10px 24px rgb(0 0 0 / 55%));
  animation: showcase-float 4.8s ease-in-out infinite;
}

.showcase-particle {
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 4;
  width: var(--particle-size);
  height: var(--particle-size);
  margin-left: calc(var(--particle-size) / -2);
  border-radius: 999px;
  background: var(--ring-color);
  box-shadow:
    0 0 12px var(--ring-color),
    0 0 22px rgb(255 255 255 / 40%);
  opacity: 0;
  animation-name: showcase-particle-rise;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

@keyframes showcase-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes showcase-ring-pulse {
  0%,
  100% {
    opacity: 0.82;
    transform: translate(-50%, 50%) scale(1);
  }

  50% {
    opacity: 1;
    transform: translate(-50%, 50%) scale(1.035);
  }
}

@keyframes showcase-ring-dash {
  to {
    stroke-dashoffset: -200;
  }
}

@keyframes showcase-particle-rise {
  0% {
    transform: translateX(var(--start-x)) translateY(0) scale(0.3);
    opacity: 0;
  }

  14% {
    opacity: 1;
  }

  70% {
    opacity: 0.75;
  }

  100% {
    transform: translateX(var(--end-x)) translateY(-260px) scale(0.15);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .showcase-ring-wrap,
  .showcase-portrait,
  .showcase-particle,
  .ring-dash {
    animation: none !important;
  }

  .showcase-particle {
    display: none;
  }
}
</style>
