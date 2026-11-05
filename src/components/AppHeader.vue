<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import PlayerProfilePanel from '@/components/PlayerProfilePanel.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const mostrarConfirmacion = ref(false)

// Header compartido por lobby, tienda y personajes: mismo estilo y opciones,
// la opción de la pantalla actual se resalta en magenta.
const opciones = [
  { label: 'INICIO', path: '/lobby' },
  { label: 'PERSONAJES', path: '/characters' },
  { label: 'TIENDA', path: '/store' },
]

async function irLogin() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header
    class="app-header relative w-full h-[150px] bg-[#000000]/50 backdrop-blur-sm flex items-center px-4"
  >
    <PlayerProfilePanel compact />

    <!-- Menú central -->
    <nav class="header-nav absolute left-1/2 -translate-x-1/2 flex items-center gap-20">
      <button v-for="opcion in opciones" :key="opcion.path" @click="router.push(opcion.path)">
        <h1
          class="font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
          :class="route.path === opcion.path ? 'text-[#FB00FF]' : 'text-white'"
        >
          {{ opcion.label }}
        </h1>
      </button>
    </nav>

    <!-- Acciones derecha -->
    <div class="header-actions ml-auto flex items-center gap-8">
      <div class="flex items-center gap-2">
        <img src="/img/iconos/moneda.png" alt="puntos" class="h-[30px]" />
        <h1 class="font-pixel text-[20px] text-[#FB00FF]">{{ profileStore.coins }}</h1>
      </div>

      <button
        @click="mostrarConfirmacion = true"
        class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]"
      >
        <img src="/img/iconos/salida.png" alt="cierre de sesión" class="w-full h-full object-cover" />
      </button>
    </div>
  </header>

  <!-- Modal confirmación salida -->
  <div
    v-if="mostrarConfirmacion"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
  >
    <div class="confirm-dialog w-[700px] h-[400px] bg-black border-4 border-[#8B7A91] rounded-lg">
      <h1 class="font-pixel text-[#FB00FF] text-3xl text-center mt-8">
        ¿ESTÁS SEGURO DE QUE QUIERES SALIR?
      </h1>

      <div class="flex flex-col items-center gap-8 mt-16">
        <button
          @click="irLogin"
          class="font-pixel text-white w-[250px] h-[60px] bg-[#2A1A4B] rounded-xl border-2 border-fuchsia-500 transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF] hover:-translate-y-2"
        >
          SI
        </button>

        <button
          @click="mostrarConfirmacion = false"
          class="font-pixel text-white w-[250px] h-[60px] bg-[#2A1A4B] rounded-xl border-2 border-fuchsia-500 transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF] hover:-translate-y-2"
        >
          NO
        </button>
      </div>
    </div>
  </div>
</template>
