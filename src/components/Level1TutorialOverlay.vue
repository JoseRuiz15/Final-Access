<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Phaser from 'phaser'

const props = defineProps({
  scene: { type: Object, required: true },
  game: { type: Object, required: true },
  items: { type: Array, default: () => [] },
})

const worldLayer = ref(null)
const MOBILE_ZOOM_FACTOR = 1.3
let game = null

function markerStyle(item) {
  const isMobileLandscape = props.scene?.mobileLandscapeLayout === true
  const scale = isMobileLandscape ? MOBILE_ZOOM_FACTOR : 1

  return {
    left: `${isMobileLandscape ? (item.mobileX ?? item.x / scale) : item.x}px`,
    top: `${isMobileLandscape ? (item.mobileY ?? item.y / scale) : item.y}px`,
    width: `${isMobileLandscape ? (item.mobileWidth ?? item.width / scale) : item.width}px`,
  }
}

function syncWorldLayer() {
  const layer = worldLayer.value
  const camera = props.scene?.cameras?.main
  const canvas = game?.canvas
  const scale = game?.scale
  if (!layer || !camera || !canvas || !scale?.width || !scale?.height) return

  const rect = canvas.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const cssScaleX = rect.width / scale.width
  const cssScaleY = rect.height / scale.height
  const zoomX = camera.zoomX || camera.zoom || 1
  const zoomY = camera.zoomY || camera.zoom || 1

  const tx = rect.left + (camera.x - camera.scrollX * zoomX) * cssScaleX
  const ty = rect.top + (camera.y - camera.scrollY * zoomY) * cssScaleY

  layer.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${zoomX * cssScaleX}, ${zoomY * cssScaleY})`
  layer.style.visibility = 'visible'
}

function handleResize() {
  syncWorldLayer()
}

onMounted(() => {
  game = props.game
  game.events.on(Phaser.Core.Events.POST_RENDER, syncWorldLayer)
  window.addEventListener('resize', handleResize)
  syncWorldLayer()
})

onBeforeUnmount(() => {
  game?.events?.off(Phaser.Core.Events.POST_RENDER, syncWorldLayer)
  window.removeEventListener('resize', handleResize)
  game = null
})
</script>

<template>
  <aside class="level1-tutorial" aria-label="Tutorial de controles del nivel 1">
    <div ref="worldLayer" class="level1-tutorial__world">
      <div
        v-for="item in items"
        :key="item.id"
        class="level1-tutorial__marker"
        :style="markerStyle(item)"
        role="group"
        :aria-label="item.label"
      >
        <img :src="item.src" :alt="item.alt" draggable="false" />
        <span class="level1-tutorial__label">{{ item.label }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.level1-tutorial {
  position: absolute;
  inset: 0;
  z-index: 10;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

.level1-tutorial__world {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  transform-origin: 0 0;
  will-change: transform;
}

.level1-tutorial__marker {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.level1-tutorial__marker img {
  display: block;
  width: 100%;
  height: auto;
  filter: none;
  image-rendering: auto;
}

.level1-tutorial__label {
  color: #f4f6f8;
  font-family: 'Goldman', sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  text-shadow: 0 2px 4px rgb(0 0 0 / 95%);
  white-space: nowrap;
}
</style>
