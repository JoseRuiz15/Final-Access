<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCharacterStore } from '@/stores/characters'
import { useGameStore } from '@/stores/game'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const authStore = useAuthStore()
const characterStore = useCharacterStore()
const gameStore = useGameStore()
const profileStore = useProfileStore()

const mostrarConfirmacion = ref(false)
const personajeSeleccionado = ref(0)
const isLoading = ref(false)
const error = ref(null)

const personajes = computed(() => characterStore.allCharacters)

const personajeEstaEquipado = computed(
  () => personajes.value[personajeSeleccionado.value]?.isEquipped || false
)

async function initializeData() {
  isLoading.value = true
  error.value = null
  try {
    // Load the catalog and profile before deciding whether any free characters need unlocking.
    await Promise.all([characterStore.fetchCatalog(), profileStore.fetchProfile()])
    await characterStore.fetchUnlocked(profileStore.profile)
    await characterStore.autoUnlockFreeCharacters()

    // Sync equipped character from profile
    const equippedCharacterId =
      profileStore.profile?.equippedCharacterId || profileStore.profile?.characterId
    if (equippedCharacterId) {
      characterStore.setEquipped(equippedCharacterId)
      gameStore.equipCharacter(equippedCharacterId)
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error al cargar personajes'
  } finally {
    isLoading.value = false
  }
}

function selectCharacter(index) {
  personajeSeleccionado.value = index
}

async function equipCharacter() {
  const personaje = personajes.value[personajeSeleccionado.value]
  if (!personaje) return

  isLoading.value = true
  error.value = null

  try {
    if (!personaje.isUnlocked) {
      // Unlock first
      await characterStore.unlockCharacter(personaje.id)
    }
    // Equip once, then synchronize the local character state.
    await profileStore.equipCharacter(personaje.id)
    characterStore.setEquipped(personaje.id)
    gameStore.equipCharacter(personaje.id)
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error al equipar personaje'
  } finally {
    isLoading.value = false
  }
}

function irLobby() { router.push('/lobby') }
function irStore() { router.push('/store') }
function irLogin() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  initializeData()
})
</script>

<template>
  <section id="lobby-screen" class="relative min-h-screen overflow-hidden">
    <img
      src="/img/lobby/lobby2.png"
      alt="imagen del la tienda"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />

    <div class="relative z-10 min-h-screen">
      <header
        class="app-header w-full h-[150px] bg-[#050711]/50 backdrop-blur-sm border-4 border-[#2D2F4B] flex items-center px-4"
      >
        <!-- Usuario -->
        <div
          class="header-profile bg-[#050711] w-[450px] h-[110px] border-4 border-[#2D2F4B] rounded-lg flex items-center"
        >
          <div class="w-[100px] h-[100px] border-3 border-[#444665] rounded-lg overflow-hidden">
            <img
              src="/img/profile/perfil.png"
              alt="imagen de perfil"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex flex-col ml-10">
            <p class="text-white text-[30px] font-pixel">{{ authStore.user?.username || 'Usuario' }}</p>
            <p class="text-[#FB00FF] text-[14px] font-pixel mt-1">Nivel {{ authStore.user?.level || 1 }}</p>
          </div>
        </div>

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
              class="text-[#FB00FF] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
            >
              PERSONAJES
            </h1>
          </button>

          <button @click="irStore">
            <h1
              class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
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

      <!-- Error toast -->
      <div v-if="error" class="fixed bottom-10 right-10 z-50 bg-red-900/90 border border-red-500 rounded-lg p-4 text-white font-pixel text-sm max-w-md">
        {{ error }}
      </div>

      <!-- cuadro del centro -->
      <div class="character-layout min-h-[calc(100vh-150px)] flex items-center justify-center">
        <div v-if="isLoading" class="character-panel h-[480px] w-[1350px] bg-[#000313] border-4 border-[#20273C] rounded-lg flex items-center justify-center">
          <p class="font-pixel text-[#FB00FF] text-2xl">CARGANDO PERSONAJES...</p>
        </div>

        <div v-else class="character-panel h-[480px] w-[1350px] bg-[#000313] border-4 border-[#20273C] rounded-lg flex">
          <!-- donde estan los personajes -->
          <div class="character-list h-full w-[900px] flex items-center justify-center gap-10 px-10">
            <button
              v-for="(personaje, index) in personajes"
              :key="personaje.id"
              class="bg-black h-[300px] w-[200px] rounded-lg transition-all duration-300 overflow-hidden"
              :class="
                personajeSeleccionado === index
                  ? 'border-[#FF00D9] shadow-[0_0_35px_#FF00D9]'
                  : 'border-transparent hover:border-[#FF00D9] hover:shadow-[0_0_35px_#FF00D9]'
              "
              @click="selectCharacter(index)"
              :disabled="isLoading"
            >
              <div class="relative h-full w-full">
                <img
                  :src="personaje.imagen || `/img/characters/${personaje.id}.png`"
                  :alt="personaje.nombre"
                  class="h-full w-full object-cover"
                />
                <!-- Lock overlay -->
                <div v-if="!personaje.isUnlocked" class="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span class="text-6xl">🔒</span>
                </div>
                <!-- Equipped indicator -->
                <div v-if="personaje.isEquipped" class="absolute top-2 right-2 bg-[#FF00D9] text-black font-pixel text-xs px-2 py-1 rounded">
                  EQUIPADO
                </div>
              </div>
            </button>
          </div>

          <!-- cuadro derecho -->
          <div class="character-detail h-full flex-1 border-l-3 border-[#20273C] flex flex-col">
            <!-- cuadro de arriba -->
            <div class="h-1/2 border-b-3 border-[#20273C] flex">
              <!-- imagen de perfil del personaje -->
              <div class="w-1/2 h-full flex items-center justify-center">
                <div
                  class="h-[130px] w-[130px] border-4 border-[#FF00D9] rounded-lg overflow-hidden shadow-[0_0_25px_#FF00D9]"
                >
                  <img
                    :src="personajes[personajeSeleccionado]?.perfil || `/img/profile/${personajes[personajeSeleccionado]?.id}_perfil.png`"
                    :alt="personajes[personajeSeleccionado]?.nombre"
                    class="h-full w-full object-cover"
                  />
                </div>
              </div>

              <!-- nombre y boton -->
              <div class="w-1/2 h-full flex flex-col items-center justify-center gap-6 px-4">
                <h2 class="text-[#FF00D9] font-pixel text-[22px] text-center">
                  {{ personajes[personajeSeleccionado]?.nombre || 'SELECCIONA UN PERSONAJE' }}
                </h2>

                <button
                  v-if="personajes[personajeSeleccionado]"
                  @click="equipCharacter"
                  :aria-pressed="personajeEstaEquipado"
                  :disabled="isLoading || !personajes[personajeSeleccionado].isUnlocked"
                  class="h-12 w-40 font-pixel rounded-lg border-4 transition-all duration-300"
                  :class="
                    personajeEstaEquipado
                      ? 'bg-[#123C32] text-[#B7F7D5] border-[#58D6A3] shadow-[0_0_18px_#58D6A355] cursor-default'
                      : personajes[personajeSeleccionado].isUnlocked
                        ? 'bg-[#2A1A4B] text-white border-[#B17BE3] hover:shadow-[0_0_30px_#FF00D9] hover:bg-[#FF00D9] hover:border-[#FF00D9]'
                        : 'bg-[#1A1A2E] text-[#666] border-[#444] cursor-not-allowed'
                  "
                >
                  {{ personajeEstaEquipado ? 'EQUIPADO' : (personajes[personajeSeleccionado].isUnlocked ? 'EQUIPAR' : 'DESBLOQUEAR PRIMERO') }}
                </button>
              </div>
            </div>

            <!-- cuadro de abajo -->
            <div class="h-1/2 p-8 flex flex-col justify-center">
              <h3 class="text-white font-pixel text-[16px] mb-4">HABILIDAD</h3>

              <p class="text-[#FF00D9] font-pixel text-[14px] mb-6">
                {{ personajes[personajeSeleccionado]?.habilidad || '—' }}
              </p>

              <p class="text-[#9898BD] font-pixel text-[12px] leading-6">
                {{ personajes[personajeSeleccionado]?.descripcion || 'Selecciona un personaje para ver su descripción.' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

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
</section>
</template>
