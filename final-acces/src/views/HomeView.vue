<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irLogin() {
  router.push('/login')
}
</script>

<template>
  <section id="home-screen">
    <!-- Fondo -->
    <img src="/img/fondoinicio.png" alt="Fondo Final-Acces"
      class="absolute inset-0 w-full h-full object-cover"
    />

    <!-- Contenido -->
    <div id="home-content" class="relative z-10 flex items-end justify-center min-h-screen">
      <!-- Efecto de luz -->
      <div class="absolute bottom-28 flex justify-center w-full">
        <div class="w-56 h-20 rounded-full bg-[#9747FF] opacity-30 blur-3xl"></div>
      </div>

      <!-- Botón iniciar -->
      <button
        @click="irLogin"
        class="font-pixel text-[12px] relative z-20 bg-[#9747FF] text-black py-3 px-8 rounded-lg mb-24 transition-all duration-300 hover:text-white hover:shadow-[0_0_25px_#9747FF] hover:scale-105"
      >
        INICIAR
      </button>
    </div>
  </section>
</template>
