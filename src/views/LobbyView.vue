<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLobbyStore } from '@/stores/lobbies'
import { useCharacterStore } from '@/stores/characters'
import { useGameStore } from '@/stores/game'
import { useProfileStore } from '@/stores/profile'
import CharacterShowcase from '@/components/CharacterShowcase.vue'
import AppHeader from '@/components/AppHeader.vue'
import { initFlowbite } from 'flowbite'

const router = useRouter()
const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
const characterStore = useCharacterStore()
const gameStore = useGameStore()
const profileStore = useProfileStore()

const mostrarCrearLobby = ref(false)
const nuevoLobby = ref({
  name: '',
  mode: 'competitive',
  maxPlayers: 4,
  isPrivate: false,
})
const isCreating = ref(false)
const createError = ref(null)

// El lobby muestra el personaje equipado. Si la API falla, usa la selección
// guardada en localStorage por el store del juego.
const showcaseCharacterId = computed(
  () =>
    characterStore.equippedCharacterId ||
    gameStore.selectedCharacterId ||
    profileStore.profile?.equippedCharacterId ||
    profileStore.profile?.characterId ||
    'cosa1',
)

function irGameMode() {
  router.push('/gamemode')
}

function irStore() {
  router.push('/store')
}

async function fetchLobbies() {
  await lobbyStore.fetchLobbies()
}

async function handleCreateLobby() {
  if (!nuevoLobby.value.name.trim()) {
    createError.value = 'El nombre del lobby es obligatorio'
    return
  }

  isCreating.value = true
  createError.value = null

  try {
    await lobbyStore.createLobby(nuevoLobby.value)
    mostrarCrearLobby.value = false
    nuevoLobby.value.name = ''
  } catch (err) {
    createError.value = err.response?.data?.error || 'Error al crear lobby'
  } finally {
    isCreating.value = false
  }
}

async function handleJoinLobby(code) {
  const equippedCharacter = characterStore.equippedCharacterId
  try {
    await lobbyStore.joinLobby(code, { characterId: equippedCharacter })
    router.push('/lobby')
  } catch (err) {
    alert(err.response?.data?.error || 'Error al unirse al lobby')
  }
}

async function handleLeaveLobby() {
  try {
    await lobbyStore.leaveLobby()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al salir del lobby')
  }
}

function toggleReady() {
  const currentReady = lobbyStore.players.find((p) => p.userId === authStore.user?.id)?.isReady
  lobbyStore.setReady(!currentReady)
}

function startMatch() {
  lobbyStore.startMatch()
}

function cancelLobby() {
  lobbyStore.cancelLobby()
}

function openCreateModal() {
  mostrarCrearLobby.value = true
  createError.value = null
}

function closeCreateModal() {
  mostrarCrearLobby.value = false
  createError.value = null
}

// Set user ID for lobby store
onMounted(() => {
  initFlowbite()
  lobbyStore.setCurrentUserId(authStore.user?.id)
  fetchLobbies()
  profileStore.fetchProfile().catch((err) => {
    console.warn('No se pudo cargar el perfil del jugador.', err)
  })
  characterStore.fetchUnlocked().catch((err) => {
    console.warn('No se pudo cargar el personaje equipado.', err)
  })
})

onUnmounted(() => {
  lobbyStore.clearCurrentLobby()
})
</script>

<template>
  <section id="lobby-screen" class="lobby-screen relative isolate min-h-screen overflow-hidden bg-[#080e20]">
    <!--fondo del lobby-->
    <img
      src="/img/lobby/lobby2.webp"
      alt="imagen del lobby"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />

    <!-- Contenido general -->
    <div class="lobby-shell relative min-h-screen flex flex-col">
      <!-- Barra superior (compartida con tienda y personajes) -->
      <AppHeader />

      <!-- Contenido Izquierdo -->
      <main class="lobby-main flex justify-between px-10 pt-20 flex-1">
        <section class="lobby-left shrink-0">
          <!-- Misiones Diarias-->
          <div
            class="lobby-missions self-start pause-panel relative overflow-hidden border border-[#00D9FF]/70 bg-[#07101f] px-2 py-2 text-white shadow-[0_0_60px_#00D9FF33] flex flex-col gap-4 mt-5"
          >
            <div class="border border-[#00D9FF]/15">
              <div class="border border-[#00D9FF]/15 py-2 px-5">
                <p class="font-pixel text-[13px] text-[#00D9FF]">MISIONES DIARIAS</p>
              </div>

              <div class="p-5 space-y-5">
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <p class="font-pixel text-white text-[10px]">JUEGA 2 PARTIDAS</p>
                    <p class="font-pixel text-white text-[10px]">0/2</p>
                  </div>
                  <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                    <div class="h-full w-0 bg-[#A255F8] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <p class="font-pixel text-white text-[10px]">ELIMINA 10 ENEMIGOS</p>
                    <p class="font-pixel text-white text-[10px]">0/10</p>
                  </div>
                  <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                    <div class="h-full w-0 bg-[#A255F8] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <p class="font-pixel text-white text-[10px] text-[#6F89A5]">GANA 1 PARTIDA</p>
                    <p class="font-pixel text-white text-[10px] text-[#6F89A5]">0/1</p>
                  </div>
                  <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                    <div class="h-full w-0 bg-[#A255F8] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carrusel de tienda -->

          <div
            id="default-carousel"
            class="lobby-carousel relative w-80 h-52 border border-[#00D9FF]/70 bg-[#07101f] px-2 py-2 shadow-[0_0_60px_#00D9FF33] mt-20"
            data-carousel="slide"
          >
            <div class="relative w-full h-full overflow-hidden border border-[#00D9FF]/15">
              <div class="hidden duration-400 ease-in-out" data-carousel-item="active">
                <img
                  src="/img/store/tienda1.png"
                  class="absolute inset-0 block w-full h-full object-cover cursor-pointer"
                  alt="tienda 1"
                  @click="irStore"
                />
              </div>
              <div class="hidden duration-400 ease-in-out" data-carousel-item>
                <img
                  src="/img/store/tienda2.png"
                  class="absolute inset-0 block w-full h-full object-cover cursor-pointer"
                  alt="tienda 2"
                  @click="irStore"
                />
              </div>
              <div class="hidden duration-400 ease-in-out" data-carousel-item>
                <img
                  src="/img/store/tienda3.png"
                  class="absolute inset-0 block w-full h-full object-cover cursor-pointer"
                  alt="tienda 3"
                  @click="irStore"
                />
              </div>
            </div>
            <div class="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
              <button
                type="button"
                class="w-3 h-3 rounded-full bg-white/70"
                aria-current="true"
                aria-label="Slide 1"
                data-carousel-slide-to="0"
              ></button>
              <button
                type="button"
                class="w-3 h-3 rounded-full bg-white/70"
                aria-current="false"
                aria-label="Slide 2"
                data-carousel-slide-to="1"
              ></button>
              <button
                type="button"
                class="w-3 h-3 rounded-full bg-white/70"
                aria-current="false"
                aria-label="Slide 3"
                data-carousel-slide-to="2"
              ></button>
            </div>
          </div>
        </section>

        <!-- Personaje equipado en el centro del lobby -->
        <div
          class="lobby-showcase pointer-events-none hidden min-w-0 flex-1 -translate-y-10 justify-center self-center xl:flex"
        >
          <CharacterShowcase :character-id="showcaseCharacterId" />
        </div>

        <!-- Lado derecho -->
        <section class="lobby-widgets flex flex-col items-center gap-20 shrink-0">
          <!-- Botón jugar -->
          <button
            v-if="!lobbyStore.isInLobby"
            type="button"
            class="lobby-play-button cursor-pointer select-none w-80 bg-[#00D9FF] border border-[#00D9FF]/70 px-6 py-4 font-pixel text-[10px] text-[#050711] shadow-[0_0_60px_#00D9FF33] transition hover:bg-white hover:shadow-[0_0_24px_#00D9FF66]"
            @click="irGameMode"
          >
            JUGAR
          </button>
        </section>
      </main>
    </div>
  </section>
</template>

<style scoped>
#lobby-screen {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.lobby-shell {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.lobby-main {
  min-height: 0;
  align-items: center;
  gap: clamp(1rem, 3vw, 3rem);
  padding: clamp(1rem, 3vh, 2.5rem) clamp(1rem, 3vw, 3rem);
  overflow: hidden;
}

.lobby-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(0.75rem, 2vh, 1.5rem);
}

.lobby-missions,
.lobby-carousel {
  width: clamp(15rem, 24vw, 20rem);
  margin: 0 !important;
}

.lobby-carousel {
  height: clamp(8rem, 24vh, 13rem);
}

.lobby-widgets {
  justify-content: center;
  gap: 0 !important;
}

.lobby-play-button {
  width: clamp(15rem, 24vw, 20rem);
  margin: 0 !important;
}

@media (max-width: 767px) {
  #lobby-screen {
    overflow: hidden;
  }

  #lobby-screen .lobby-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
    align-content: stretch;
    gap: clamp(0.4rem, 1.3vh, 0.7rem);
    padding: clamp(0.4rem, 1.2vh, 0.7rem) clamp(0.55rem, 2.5vw, 0.85rem)
      max(env(safe-area-inset-bottom), 0.45rem);
  }

  .lobby-left {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
    align-content: center;
    align-items: stretch;
    gap: clamp(0.35rem, 1.4vw, 0.6rem);
    min-height: 0;
  }

  .lobby-missions {
    width: 100%;
    padding: clamp(0.25rem, 0.9vw, 0.45rem) !important;
  }

  .lobby-missions > div > div:first-child {
    padding: clamp(0.3rem, 1vh, 0.45rem) clamp(0.35rem, 1.5vw, 0.55rem) !important;
  }

  .lobby-missions > div > div:first-child p {
    font-size: clamp(6px, 1.8vw, 9px) !important;
  }

  .lobby-missions > div > div:last-child {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    gap: clamp(0.3rem, 1vh, 0.55rem);
    padding: clamp(0.3rem, 1.2vw, 0.55rem) !important;
  }

  .lobby-missions > div > div:last-child p {
    font-size: clamp(5px, 1.45vw, 7px) !important;
    line-height: 1.25;
  }

  .lobby-carousel {
    width: 100%;
    height: auto;
    min-height: 0;
    aspect-ratio: 1.15 / 1;
    padding: clamp(0.2rem, 0.7vw, 0.35rem) !important;
  }

  .lobby-widgets {
    align-items: center;
    min-height: 0;
  }

  .lobby-play-button {
    width: min(72vw, 15rem);
    min-height: clamp(2.35rem, 6vh, 2.9rem);
    padding: 0.55rem 0.8rem !important;
    font-size: clamp(8px, 2.3vw, 10px) !important;
  }
}

@media (max-width: 380px) {
  .lobby-left {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.8fr);
  }

  .lobby-missions > div > div:last-child p {
    font-size: clamp(5px, 1.55vw, 6px) !important;
  }
}

@media (max-height: 520px) and (max-width: 767px) {
  .lobby-main {
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 0.4rem;
    padding-top: 0.4rem;
  }

  .lobby-carousel {
    max-height: 38vh;
  }

  .lobby-play-button {
    min-height: 2.15rem;
    padding-block: 0.4rem !important;
  }
}
</style>
