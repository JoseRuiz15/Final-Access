<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/characters'
import { useGameStore } from '@/stores/game'
import { useProfileStore } from '@/stores/profile'
import AppHeader from '@/components/AppHeader.vue'

const characterStore = useCharacterStore()
const gameStore = useGameStore()
const profileStore = useProfileStore()

const personajeSeleccionado = ref(0)
const isLoading = ref(false)
const error = ref(null)

const personajes = computed(() => characterStore.allCharacters)

const personajeEstaEquipado = computed(
  () => personajes.value[personajeSeleccionado.value]?.isEquipped || false,
)

async function initializeData() {
  isLoading.value = true
  error.value = null
  try {
    // Catálogo y perfil se piden por separado: si el perfil falla (sesión
    // caducada, error de red...) los personajes deben seguir viéndose. Con
    // Promise.all un solo fallo abortaba el resto y la lista se quedaba
    // vacía o con los personajes bloqueados.
    const [catalogo, perfil] = await Promise.allSettled([
      characterStore.fetchCatalog(),
      profileStore.fetchProfile(),
    ])

    // Si el catálogo falla no hay nada que pintar: es un error de verdad.
    if (catalogo.status === 'rejected') throw catalogo.reason

    if (perfil.status === 'fulfilled') {
      await characterStore.fetchUnlocked(profileStore.profile)
      await characterStore.autoUnlockFreeCharacters()

      // Sync equipped character from profile
      const equippedCharacterId =
        profileStore.profile?.equippedCharacterId || profileStore.profile?.characterId
      if (equippedCharacterId) {
        characterStore.setEquipped(equippedCharacterId)
        gameStore.equipCharacter(equippedCharacterId)
      }
    } else {
      // Sin perfil no se sabe qué personajes están desbloqueados: se avisa,
      // pero el catálogo sigue en pantalla.
      error.value =
        perfil.reason?.response?.data?.message ||
        'No se pudo cargar tu perfil. Si la sesión ha caducado, vuelve a entrar.'
    }
  } catch (err) {
    error.value =
      err.response?.data?.message || err.response?.data?.error || 'Error al cargar personajes'
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
    error.value =
      err.response?.data?.message || err.response?.data?.error || 'Error al equipar personaje'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initializeData()
})
</script>

<template>
  <section id="lobby-screen" class="relative isolate min-h-screen overflow-hidden bg-[#080e20]">
    <img
      src="/img/lobby/lobby2.webp"
      alt="imagen del la tienda"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />

    <div class="relative z-10 min-h-screen">
      <AppHeader />

      <!-- Error toast -->
      <div
        v-if="error"
        class="fixed bottom-10 right-10 z-50 bg-red-900/90 border border-red-500 rounded-lg p-4 text-white font-pixel text-sm max-w-md"
      >
        {{ error }}
      </div>

      <!-- cuadro del centro -->
      <div class="character-layout min-h-[calc(100vh-150px)] flex items-center justify-center">
        <div
          v-if="isLoading"
          class="character-panel h-[480px] w-[1350px] border border-[#FB00FF55] bg-[#07101f] px-2 py-2 shadow-[0_0_60px_#FB00FF55] outline-1 outline-[#FB00FF55] [outline-offset:-9px] flex items-center justify-center"
        >
          <p class="font-pixel text-[#FB00FF] text-2xl">CARGANDO PERSONAJES...</p>
        </div>

        <div
          v-else
          class="character-panel h-[480px] w-[1350px] border border-[#FB00FF55] bg-[#07101f] px-2 py-2 shadow-[0_0_60px_#FB00FF55] outline-1 outline-[#FB00FF55] [outline-offset:-9px] flex"
        >
          <!-- donde estan los personajes -->
          <div
            class="character-list h-full w-[900px] flex items-center justify-center gap-10 px-10"
          >
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
                <div
                  v-if="!personaje.isUnlocked"
                  class="absolute inset-0 bg-black/70 flex items-center justify-center"
                >
                  <span class="text-6xl">🔒</span>
                </div>
                <!-- Equipped indicator -->
                <div
                  v-if="personaje.isEquipped"
                  class="absolute top-2 left-1/2 -translate-x-1/2 bg-[#FF00D9] text-black font-pixel text-xs px-2 py-1 rounded"
                >
                  EQUIPADO
                </div>
              </div>
            </button>
          </div>

          <!-- cuadro derecho -->
          <div class="character-detail h-full flex-1 border-l-3 border-[#FB00FF55] flex flex-col">
            <!-- cuadro de arriba -->
            <div class="h-1/2 border-b-3 border-[#FB00FF55] flex">
              <!-- imagen de perfil del personaje -->
              <div class="w-1/2 h-full flex items-center justify-center">
                <div
                  class="h-[130px] w-[130px] border-4 border-[#FB00FF55] rounded-lg overflow-hidden shadow-[0_0_25px_#FB00FF55]"
                >
                  <img
                    :src="
                      personajes[personajeSeleccionado]?.perfil ||
                      `/img/profile/${personajes[personajeSeleccionado]?.id}_perfil.webp`
                    "
                    :alt="personajes[personajeSeleccionado]?.nombre"
                    class="h-full w-full object-cover"
                  />
                </div>
              </div>

              <!-- nombre y boton -->
              <div class="w-1/2 h-full flex flex-col items-center justify-center gap-6 px-4">
                <h2 class="text-[#FB00FF] font-pixel text-[22px] text-center">
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
                        ? 'bg-[#2A1A4B] text-white border-[#B17BE3] hover:shadow-[0_0_30px_#FB00FF55] hover:bg-[#FB00FF55] hover:border-[#FB00FF55] hover:text-[#050711]'
                        : 'bg-[#1A1A2E] text-[#666] border-[#444] cursor-not-allowed'
                  "
                >
                  {{
                    personajeEstaEquipado
                      ? 'EQUIPADO'
                      : personajes[personajeSeleccionado].isUnlocked
                        ? 'EQUIPAR'
                        : 'DESBLOQUEAR PRIMERO'
                  }}
                </button>
              </div>
            </div>

            <!-- cuadro de abajo -->
            <div class="h-1/2 p-8 flex flex-col justify-center">
              <h3 class="text-white font-pixel text-[16px] mb-4">HABILIDAD</h3>

              <p class="text-[#FB00FF] font-pixel text-[14px] mb-6">
                {{ personajes[personajeSeleccionado]?.habilidad || '—' }}
              </p>

              <p class="text-[#9898BD] font-pixel text-[12px] leading-6">
                {{
                  personajes[personajeSeleccionado]?.descripcion ||
                  'Selecciona un personaje para ver su descripción.'
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>
