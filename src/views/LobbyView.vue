<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLobbyStore } from '@/stores/lobbies'
import { useCharacterStore } from '@/stores/characters'
import { initFlowbite } from 'flowbite'

const router = useRouter()
const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
const characterStore = useCharacterStore()

const mostrarConfirmacion = ref(false)
const mostrarCrearLobby = ref(false)
const nuevoLobby = ref({
  name: '',
  mode: 'competitive',
  maxPlayers: 4,
  isPrivate: false,
})
const isCreating = ref(false)
const createError = ref(null)

function irGameMode() {
  router.push('/gamemode')
}

function irCharacters() {
  router.push('/characters')
}

function irStore() {
  router.push('/store')
}

async function irLogin() {
  await authStore.logout()
  router.push('/login')
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
  const currentReady = lobbyStore.players.find(p => p.userId === authStore.user?.id)?.isReady
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
  characterStore.fetchUnlocked()
})

onUnmounted(() => {
  lobbyStore.clearCurrentLobby()
})
</script>

<template>
  <section id="lobby-screen" class="relative min-h-screen overflow-hidden">
    <!--fondo del lobby-->
    <img
      src="/img/lobby/lobby2.png"
      alt="imagen del lobby"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />

    <!-- Contenido general -->
    <div class="relative min-h-screen flex flex-col">
      <!-- Barra superior -->
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
          <h1
            class="text-[#FB00FF] hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2] font-pixel"
          >
            INICIO
          </h1>

          <button @click="irCharacters">
            <h1
              class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
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
            <h1 class="font-pixel text-[20px] text-[#FB00FF]">{{ authStore.user?.coins || 0 }}</h1>
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

      <!-- Contenido principal -->
      <main class="lobby-main flex justify-between px-10 pt-20 flex-1">
        <!-- Lado izquierdo -->
        <section class="lobby-shortcuts flex flex-col gap-10">
          <button
            class="h-20 w-80 border-4 border-[#00FFEA] bg-[#000004] rounded-lg flex items-center transition-all duration-300 hover:shadow-[0_0_20px_#00FFEA] hover:-translate-y-2"
            @click="openCreateModal"
          >
            <div class="h-15 w-15 ml-[10px] rounded-lg flex items-center justify-center">
              <img src="/img/iconos/clasificatoria.png" alt="crear lobby" />
            </div>

            <h1 class="text-[#9898BD] font-pixel text-[15px] ml-[10px]">CREAR LOBBY</h1>
          </button>

          <button
            class="h-20 w-80 border-4 border-[#00FFEA] bg-[#000004] rounded-lg flex items-center transition-all duration-300 hover:shadow-[0_0_20px_#00FFEA] hover:-translate-y-2"
            @click="fetchLobbies"
          >
            <div class="h-15 w-15 ml-[10px] rounded-lg flex items-center justify-center">
              <img src="/img/iconos/amigos.png" alt="buscar lobbies" />
            </div>

            <div class="ml-[10px]">
              <h1 class="text-[#9898BD] font-pixel text-[15px]">BUSCAR LOBBIES</h1>

              <p class="text-[#777787] font-pixel text-[12px]">{{ lobbyStore.lobbies.length }} disponibles</p>
            </div>
          </button>
        </section>

        <!-- Lado derecho -->
        <section class="lobby-widgets flex flex-col items-center gap-20">
          <!-- Mi Lobby Actual -->
          <div v-if="lobbyStore.isInLobby" class="bg-[#000208] w-80 border-3 border-[#FF00D9] rounded-lg p-5">
            <div class="border-b-[3px] border-[#FF00D9] py-2 px-5 mb-4">
              <p class="font-pixel text-[13px] text-[#FF00D9] flex justify-between">
                MI LOBBY: {{ lobbyStore.currentLobby?.code }}
                <span class="text-[#00FFEA]">{{ lobbyStore.players.length }}/{{ lobbyStore.currentLobby?.maxPlayers }}</span>
              </p>
            </div>

            <div class="space-y-3">
              <div v-for="player in lobbyStore.players" :key="player.userId" class="flex justify-between items-center p-2 bg-black/30 rounded">
                <span class="font-pixel text-white text-[11px]">{{ player.username }}</span>
                <div class="flex items-center gap-2">
                  <span v-if="player.isReady" class="text-green-400 font-pixel text-[10px]">✓ LISTO</span>
                  <span v-else class="text-yellow-400 font-pixel text-[10px]">ESPERANDO</span>
                  <span v-if="player.isCreator" class="text-purple-400 font-pixel text-[10px]">★ CREADOR</span>
                </div>
              </div>

              <div class="pt-2 border-t border-[#2D2F4B] flex flex-col gap-2">
                <button
                  @click="toggleReady"
                  :disabled="lobbyStore.isLoading"
                  class="w-full h-10 font-pixel text-[11px] rounded-lg border-2 transition-all duration-300"
                  :class="lobbyStore.players.find(p => p.userId === authStore.user?.id)?.isReady
                    ? 'bg-[#123C32] text-[#B7F7D5] border-[#58D6A3] hover:bg-[#0A5C2E]'
                    : 'bg-[#2A1A4B] text-white border-[#B17BE3] hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]'"
                >
                  {{ lobbyStore.players.find(p => p.userId === authStore.user?.id)?.isReady ? 'DESISTIR' : 'LISTO' }}
                </button>

                <button
                  v-if="lobbyStore.isCreator"
                  @click="startMatch"
                  :disabled="!lobbyStore.allReady || lobbyStore.isLoading"
                  class="w-full h-10 bg-[#FF00D9] text-black font-pixel text-[11px] rounded-lg border-2 border-[#FF00D9] transition-all duration-300 hover:bg-[#FF33E0] hover:shadow-[0_0_20px_#FF00D9] disabled:opacity-50"
                >
                  INICIAR PARTIDA
                </button>

                <button
                  v-if="!lobbyStore.isCreator"
                  @click="handleLeaveLobby"
                  class="w-full h-10 bg-[#4B1A2A] text-white font-pixel text-[11px] rounded-lg border-2 border-[#8B3A4A] transition-all duration-300 hover:bg-[#6B2A3A] hover:shadow-[0_0_20px_#FF0055]"
                >
                  SALIR DEL LOBBY
                </button>

                <button
                  v-if="lobbyStore.isCreator"
                  @click="cancelLobby"
                  class="w-full h-10 bg-[#4B1A2A] text-white font-pixel text-[11px] rounded-lg border-2 border-[#8B3A4A] transition-all duration-300 hover:bg-[#6B2A3A] hover:shadow-[0_0_20px_#FF0055]"
                >
                  CANCELAR LOBBY
                </button>
              </div>
            </div>
          </div>

          <!-- Misiones diarias (placeholder) -->
          <section
            class="bg-[#000208] w-80 h-52 border-3 border-[#2D2F4B] rounded-lg flex flex-col"
          >
            <div class="border-b-[3px] border-[#8450C2] py-2 px-5">
              <p class="font-pixel text-[13px] text-[#8450C2]">MISIONES DIARIAS</p>
            </div>

            <div class="p-5 space-y-5">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <p class="font-pixel text-[10px] text-[#6F89A5]">JUEGA 2 PARTIDAS</p>
                  <p class="font-pixel text-[10px] text-[#6F89A5]">0/2</p>
                </div>
                <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                  <div class="h-full w-0 bg-[#A255F8] rounded-full"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <p class="font-pixel text-[10px] text-[#6F89A5]">ELIMINA 10 ENEMIGOS</p>
                  <p class="font-pixel text-[10px] text-[#6F89A5]">0/10</p>
                </div>
                <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                  <div class="h-full w-0 bg-[#A255F8] rounded-full"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <p class="font-pixel text-[10px] text-[#6F89A5]">GANA 1 PARTIDA</p>
                  <p class="font-pixel text-[10px] text-[#6F89A5]">0/1</p>
                </div>
                <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                  <div class="h-full w-0 bg-[#A255F8] rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          <!-- Carrusel de tienda -->
          <div id="default-carousel" class="relative w-80 h-52" data-carousel="slide">
            <div
              class="relative w-full h-full overflow-hidden rounded-lg border-3 border-[#2D2F4B] bg-[#000208]"
            >
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
              <button type="button" class="w-3 h-3 rounded-full bg-white/70" aria-current="true" aria-label="Slide 1" data-carousel-slide-to="0"></button>
              <button type="button" class="w-3 h-3 rounded-full bg-white/70" aria-current="false" aria-label="Slide 2" data-carousel-slide-to="1"></button>
              <button type="button" class="w-3 h-3 rounded-full bg-white/70" aria-current="false" aria-label="Slide 3" data-carousel-slide-to="2"></button>
            </div>
          </div>

          <!-- Botón jugar (para modo single player) -->
          <button
            v-if="!lobbyStore.isInLobby"
            class="bg-[#2A1A4B] h-15 w-80 text-white font-pixel rounded-lg border-4 border-[#B17BE3] transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF] hover:-translate-y-2"
            @click="irGameMode"
          >
            JUGAR SOLO
          </button>
        </section>
      </main>
    </div>
  </section>

  <!-- Modal crear lobby -->
  <div v-if="mostrarCrearLobby" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div class="create-lobby-modal w-[600px] bg-black border-4 border-[#FF00D9] rounded-lg p-8">
      <h1 class="font-pixel text-[#FF00D9] text-2xl text-center mb-6">CREAR NUEVO LOBBY</h1>

      <div v-if="createError" class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm font-pixel text-center">
        {{ createError }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block font-pixel text-white text-[12px] mb-2">NOMBRE DEL LOBBY</label>
          <input
            v-model="nuevoLobby.name"
            type="text"
            maxlength="30"
            class="w-full bg-[#1A1A2E] border-2 border-[#41334B] rounded-lg p-3 text-white font-pixel text-[14px] focus:border-[#FF00D9] focus:outline-none"
            placeholder="Mi Lobby Épico"
          />
        </div>

        <div>
          <label class="block font-pixel text-white text-[12px] mb-2">MODO</label>
          <select
            v-model="nuevoLobby.mode"
            class="w-full bg-[#1A1A2E] border-2 border-[#41334B] rounded-lg p-3 text-white font-pixel text-[14px] focus:border-[#FF00D9] focus:outline-none"
          >
            <option value="competitive">Competitivo</option>
            <option value="collaborative">Colaborativo</option>
          </select>
        </div>

        <div>
          <label class="block font-pixel text-white text-[12px] mb-2">MÁXIMO JUGADORES</label>
          <select
            v-model="nuevoLobby.maxPlayers"
            class="w-full bg-[#1A1A2E] border-2 border-[#41334B] rounded-lg p-3 text-white font-pixel text-[14px] focus:border-[#FF00D9] focus:outline-none"
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </div>

        <div class="flex items-center gap-3">
          <input
            v-model="nuevoLobby.isPrivate"
            type="checkbox"
            id="private-lobby"
            class="w-5 h-5 accent-[#FF00D9]"
          />
          <label for="private-lobby" class="font-pixel text-white text-[12px]">Lobby privado (solo con código)</label>
        </div>

        <div class="flex gap-4 mt-6">
          <button
            @click="closeCreateModal"
            class="flex-1 h-12 font-pixel text-white rounded-lg border-2 border-[#41334B] bg-[#1A1A2E] transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]"
          >
            CANCELAR
          </button>
          <button
            @click="handleCreateLobby"
            :disabled="isCreating"
            class="flex-1 h-12 font-pixel text-black rounded-lg border-2 border-[#FF00D9] bg-[#FF00D9] transition-all duration-300 hover:bg-[#FF33E0] hover:shadow-[0_0_20px_#FF00D9] disabled:opacity-50"
          >
            {{ isCreating ? 'CREANDO...' : 'CREAR LOBBY' }}
          </button>
        </div>
      </div>
    </div>
  </div>

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