<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irLevels() {
  router.push('/levels')
}

function irMultiplayer() {
  router.push('/multiplayer')
}
function irLobby() {
  router.push('/lobby')
}
</script>
<template>
  <section class="relative isolate min-h-screen overflow-hidden bg-[#080e20]">
    <img
      src="/img/lobby/a.webp"
      alt=""
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 z-0 h-full w-full object-cover"
    />

    <button
      class="absolute top-6 left-6 z-20 text-white font-pixel text-[13px] hover:text-[#FF00D9] hover:text-shadow-[0_0_30px_#FF00D9] transition-all duration-300"
      @click="irLobby"
    >
      &lt;- VOLVER AL MENU
    </button>

    <div class="game-mode-screen relative z-10 flex min-h-screen items-center justify-center bg-transparent">
      <div class="game-mode-panel h-120 w-150 bg-[#0C0C0C]/50 rounded-lg backdrop-blur-sm">
      <!--texto que mas quieres que te diga-->
      <p class="text-[#1FD0E4] font-pixel mt-10 text-center">SELECCIONA EL MODO DE JUEGO</p>

      <div class="game-mode-labels flex items-center justify-center mt-10">
        <p class="text-[#FF00D9] font-pixel text-center ml-5">JUGAR SOLO</p>
        <p class="text-[#FF00D9] font-pixel ml-25">MULTIJUGADOR</p>
      </div>

      <!--cajas para el modo de juego-->
      <div class="game-mode-cards flex items-center justify-center mt-[5px]">
        <!--solo jugador-->
        <button
          class="bg-white h-70 w-50 rounded-lg hover:scale-105 hover:shadow-[0_0_40px_#FF00D9]"
          @click="irLevels"
        >
          <img src="/img/game-mode/solo.png" alt="img solo jugador" class="rounded-lg" />
        </button>
        <!--multijugador-->
        <button
          class="h-70 w-50 ml-20 rounded-lg hover:scale-105 hover:shadow-[0_0_40px_#FF00D9]"
          @click="irMultiplayer"
        >
          <img src="/img/game-mode/multy.png" alt="img multijugador" class="rounded-lg" />
        </button>
      </div>
      </div>
    </div>
  </section>
</template>
