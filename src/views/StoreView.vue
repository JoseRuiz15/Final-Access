<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCharacterStore } from '@/stores/characters'
import { useProfileStore } from '@/stores/profile'
import PlayerProfilePanel from '@/components/PlayerProfilePanel.vue'
import { initFlowbite } from 'flowbite'

const router = useRouter()
const authStore = useAuthStore()
const characterStore = useCharacterStore()
const profileStore = useProfileStore()

const mostrarConfirmacion = ref(false)
const personajeSeleccionado = ref(null)
const isLoading = ref(false)

const storeCharacters = ref([
  { id: 'samurai', nombre: 'SAMURAI', rareza: 'Épica', color: '#973BE8', precio: 12000 },
  { id: 'nomada', nombre: 'NOMADA', rareza: 'Épica', color: '#973BE8', precio: 12000 },
  { id: 'pirata', nombre: 'PIRATA', rareza: 'Épica', color: '#973BE8', precio: 12000 },
  { id: 'selva', nombre: 'SELVA', rareza: 'Rara', color: '#AEC87D', precio: 5000 },
  { id: 'apocalipsis', nombre: 'APOCALIPSIS', rareza: 'Legendaria', color: '#F7A129', precio: 50000 },
  { id: 'tecnoangel', nombre: 'TECNOÁNGEL', rareza: 'Legendaria', color: '#F7A129', precio: 50000 },
  { id: 'nemesis', nombre: 'NEMESIS', rareza: 'Mítica', color: '#D02470', precio: 100000 },
  { id: 'eclipse', nombre: 'ECLIPSE', rareza: 'Mítica', color: '#D02470', precio: 100000 },
])

function seleccionarPersonaje(personaje) {
  personajeSeleccionado.value = personaje
}

async function comprarPersonaje() {
  if (!personajeSeleccionado.value) return

  const char = storeCharacters.value.find(c => c.id === personajeSeleccionado.value.id)
  if (!char) return

  if (profileStore.coins < char.precio) {
    alert('No tienes suficientes monedas')
    return
  }

  isLoading.value = true
  try {
    // In a real implementation, this would call a purchase API endpoint
    // For now, we'll simulate by unlocking the character
    await characterStore.unlockCharacter(char.id)
    alert(`¡Has comprado ${char.nombre}!`)
    personajeSeleccionado.value = null
    // Refresh profile to get updated coins
    await profileStore.fetchProfile()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al comprar personaje')
  } finally {
    isLoading.value = false
  }
}

function irLogin() {
  authStore.logout()
  router.push('/login')
}

function irLobby() {
  router.push('/lobby')
}

function irCharacters() {
  router.push('/characters')
}

function irStore() {
  // Ya estamos en la pantalla de la tienda: no navega.
}

onMounted(() => {
  initFlowbite()
  profileStore.fetchProfile()
  characterStore.fetchCatalog()
})
</script>

<template>
  <section class="store-screen relative isolate min-h-screen bg-[#080e20]">
    <!--fondo del tienda-->
    <img
      src="/img/lobby/lobby2.webp"
      alt="imagen del la tienda"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />
    <!-- Contenido -->
    <div class="relative flex flex-col items-center justify-center">
      <!-- Barra superior -->
      <header
        class="app-header w-full h-[150px] bg-[#050711]/50 backdrop-blur-sm border-4 border-[#2D2F4B] flex items-center px-4"
      >
        <PlayerProfilePanel />

        <!-- Menú central -->
        <nav class="header-nav flex items-center gap-20 ml-16">
          <button @click="irLobby">
            <h1
              class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
            >
              INICIO
            </h1>
          </button>

          <button @click="irCharacters">
            <h1
              class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
            >
              PERSONAJES
            </h1>
          </button>

          <button @click="irStore">
            <h1
              class="text-[#FB00FF] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
            >
              TIENDA
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
            class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]"
          >
            <img src="/img/iconos/ajustes.png" alt="ajustes" class="w-full h-full object-cover" />
          </button>

          <button
            class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]"
          >
            <img src="/img/iconos/mensajes.png" alt="mensajes" class="w-full h-full object-cover" />
          </button>

          <button
            @click="mostrarConfirmacion = true"
            class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]"
          >
            <img
              src="/img/iconos/salida.png"
              alt="cierre de sesión"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      <!-- Paneles -->
      <div class="store-content flex justify-center gap-10 mt-30">
        <!-- Panel izquierdo -->
        <div class="store-inventory w-[650px] h-[470px] bg-black/70 rounded-lg border-2 border-gray-500 p-8">
          <div class="grid grid-cols-4 gap-8">
            <button
              v-for="personaje in storeCharacters"
              :key="personaje.id"
              @click="seleccionarPersonaje(personaje)"
              :class="[
                'w-32 h-32 bg-[#161C37] rounded-xl flex flex-col items-center justify-center transition-all duration-300',
                personajeSeleccionado?.id === personaje.id
                  ? 'border-2 border-fuchsia-500 shadow-[inset_0_0_20px_#FB00FF] -translate-y-2'
                  : 'border-2 border-[#45495C] hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2'
              ]"
            >
              <span class="font-pixel text-white text-[10px]">{{ personaje.nombre }}</span>
              <span class="font-pixel" :style="{ color: personaje.color }">{{ personaje.rareza }}</span>
            </button>
          </div>
        </div>

        <!-- Panel derecho -->
        <div class="store-preview grid grid-rows-[470px_auto] gap-4">
          <div class="store-preview-image w-[300px] h-[470px] bg-black/70 rounded-lg border-2 border-gray-500 flex items-center justify-center">
            <img
              v-if="personajeSeleccionado"
              :src="`/img/characters/${personajeSeleccionado.id}.png`"
              :alt="personajeSeleccionado.nombre"
              class="w-full h-full object-contain p-8"
            />
            <div v-else class="text-center text-[#777787] font-pixel">
              <p class="text-xl mb-2">SELECCIONA UN</p>
              <p class="text-xl">PERSONAJE</p>
            </div>
          </div>

          <div v-if="personajeSeleccionado" class="flex flex-col items-center gap-4">
            <div class="w-[220px] h-12 mt-4 bg-[#2E1E3E] rounded-xl border-2 border-fuchsia-500 flex items-center justify-center gap-3 transition-all duration-300 hover:border-fuchsia-400 hover:shadow-[0_0_20px_#FB00FF] hover:-translate-y-2">
              <img src="/img/iconos/moneda.png" class="w-6 h-6" />
              <span class="font-pixel text-white"> {{ personajeSeleccionado.precio.toLocaleString() }} </span>
            </div>

            <button
              v-if="!characterStore.getCharacterById(personajeSeleccionado.id)?.isUnlocked"
              @click="comprarPersonaje"
              :disabled="isLoading || profileStore.coins < personajeSeleccionado.precio"
              class="w-[220px] h-12 bg-[#2A1A4B] text-white font-pixel rounded-xl border-2 border-[#B17BE3] transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF] hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'COMPRANDO...' : `COMPRAR POR ${personajeSeleccionado.precio.toLocaleString()}` }}
            </button>

            <button
              v-else
              :disabled="true"
              class="w-[220px] h-12 bg-[#123C32] text-[#B7F7D5] font-pixel rounded-xl border-2 border-[#58D6A3] cursor-default"
            >
              YA POSEÍDO
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

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
