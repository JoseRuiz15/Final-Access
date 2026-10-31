<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function checkAuth() {
  if (!authStore.isAuthenticated) {
    try {
      await authStore.fetchMe()
      router.push('/lobby')
    } catch {
      // Not authenticated, stay on home
    }
  } else {
    router.push('/lobby')
  }
}

onMounted(() => {
  checkAuth()
})
</script>

<template>
  <section id="home-screen" class="min-h-screen overflow-hidden bg-[#080e20]">
    <!-- Fondo -->
    <img
      src="/img/lobby/fondoinicio.webp"
      alt="Fondo Final-Acces"
      fetchpriority="high"
      decoding="async"
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
        @click="() => router.push('/login')"
        class="cursor-pointer select-none font-pixel text-[12px] relative z-20 bg-[#9747FF] text-black py-3 px-8 rounded-lg mb-24 transition-all duration-300 hover:text-white hover:shadow-[0_0_25px_#9747FF] hover:scale-105"
      >
        INICIAR
      </button>
    </div>
  </section>
</template>
