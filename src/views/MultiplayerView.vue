<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMultiplayerStore } from '@/stores/multiplayer'

const router = useRouter()
const authStore = useAuthStore()
const multiplayerStore = useMultiplayerStore()

const roomCodeInput = ref('')
const privacyOption = ref('public')
const username = computed(() => authStore.user?.username?.trim() || '')
const hasPublicRooms = computed(() => multiplayerStore.publicRooms.length > 0)

onMounted(() => {
  multiplayerStore.connect()
})

watch(
  () => multiplayerStore.roomCode,
  (roomCode) => {
    if (roomCode) router.push('/lobby-room')
  },
)

function irLobby() {
  multiplayerStore.disconnect()
  router.push('/lobby')
}

function joinRoom(roomCode = roomCodeInput.value) {
  if (!username.value) {
    alert('Por favor inicia sesión para entrar a una sala')
    return
  }

  if (!roomCode?.trim()) {
    alert('Ingresa un código de invitación o elige una sala pública')
    return
  }

  multiplayerStore.limpiarChat()
  multiplayerStore.joinRoom(roomCode, username.value)
}

function handleCreate() {
  if (!username.value) {
    alert('Por favor inicia sesión para crear una sala')
    return
  }

  multiplayerStore.limpiarChat()
  multiplayerStore.createRoom(username.value, privacyOption.value === 'private')
}

function refreshPublicRooms() {
  multiplayerStore.fetchPublicRooms()
}
</script>

<template>
  <div class="multiplayer-screen relative isolate min-h-screen bg-[#080e20]">
    <img
      src="/img/multy-player/partida.webp"
      alt="Fondo del modo multijugador"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 -z-10 h-full w-full object-cover"
    />

    <button
      class="multiplayer-back absolute left-6 top-6 z-20 font-pixel text-[13px] text-white transition-all duration-300 hover:text-[#FF00D9] hover:text-shadow-[0_0_30px_#FF00D9]"
      @click="irLobby"
    >
      &lt;- VOLVER AL MENU
    </button>

    <section
      class="private-lobby-panel absolute left-[250px] top-[100px] flex w-[463px] flex-col rounded-lg bg-[#190C2D]/80 p-8 backdrop-blur-sm"
      aria-labelledby="create-room-title"
    >
      <h1 id="create-room-title" class="mb-6 text-center font-pixel text-[#00f7ff]">
        CREAR O UNIRSE
      </h1>

      <fieldset :disabled="!multiplayerStore.connected" class="flex flex-col gap-3">
        <legend class="mb-3 font-pixel text-[12px] text-[#D1BCFF]">VISIBILIDAD DE LA SALA</legend>

        <label
          class="cursor-pointer rounded-md border p-3 transition-colors"
          :class="
            privacyOption === 'private'
              ? 'border-[#FF00D9] bg-[#FF00D9]/10'
              : 'border-white/15 bg-black/20'
          "
        >
          <span class="flex items-center gap-3 font-pixel text-sm text-white">
            <input v-model="privacyOption" type="radio" name="privacy" value="private" />
            PRIVADA
          </span>
          <span class="ml-7 mt-1 block text-xs text-[#D1BCFF]">
            Solo se puede entrar con el código de invitación.
          </span>
        </label>

        <label
          class="cursor-pointer rounded-md border p-3 transition-colors"
          :class="
            privacyOption === 'public'
              ? 'border-[#53f4ff] bg-[#53f4ff]/10'
              : 'border-white/15 bg-black/20'
          "
        >
          <span class="flex items-center gap-3 font-pixel text-sm text-white">
            <input v-model="privacyOption" type="radio" name="privacy" value="public" />
            PÚBLICA
          </span>
          <span class="ml-7 mt-1 block text-xs text-[#D1BCFF]">
            Aparece en el buscador mientras tenga cupos.
          </span>
        </label>
      </fieldset>

      <button
        class="mt-5 h-[54px] rounded-lg border-2 border-[#53f4ff] font-pixel text-sm text-[#53f4ff] transition-all hover:bg-[#53f4ff] hover:text-[#080e20] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!multiplayerStore.connected"
        @click="handleCreate"
      >
        CREAR SALA {{ privacyOption === 'private' ? 'PRIVADA' : 'PÚBLICA' }}
      </button>

      <div class="my-5 h-px bg-white/15"></div>

      <label for="room-code" class="mb-2 font-pixel text-[12px] text-[#D1BCFF]">
        CÓDIGO DE INVITACIÓN
      </label>
      <input
        id="room-code"
        v-model="roomCodeInput"
        type="text"
        maxlength="4"
        autocomplete="off"
        placeholder="EJ: R13W"
        class="login-input h-[45px] w-full rounded-[5px] border border-white/10 bg-[#06093d]/70 px-4 text-center font-orbitron text-white uppercase"
        :disabled="!multiplayerStore.connected"
        @keyup.enter="joinRoom()"
      />
      <button
        class="mt-3 h-[48px] rounded-lg bg-[#53f4ff] font-pixel text-sm text-[#080e20] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!multiplayerStore.connected"
        @click="joinRoom()"
      >
        ENTRAR CON CÓDIGO
      </button>

      <p
        aria-live="polite"
        class="mt-5 text-center text-xs"
        :class="multiplayerStore.connected ? 'text-[#7DF4FF]' : 'text-[#FFB2B8]'"
      >
        {{
          multiplayerStore.connected
            ? 'SERVIDOR CONECTADO'
            : multiplayerStore.connectionError || 'CONECTANDO…'
        }}
      </p>
    </section>

    <section
      class="server-browser-panel absolute right-[200px] top-[80px] h-[720px] w-[793px] rounded-lg border border-[#3B494B] bg-[#190C2D]/80 p-5 backdrop-blur-sm"
      aria-labelledby="public-rooms-title"
    >
      <div class="mb-4 border-b border-[#4A4A6A] pb-4">
        <h2 id="public-rooms-title" class="font-pixel text-[20px] text-[#ECDCFF]">
          BUSCADOR DE PARTIDAS
        </h2>
        <div class="mt-2 flex items-center justify-between gap-4">
          <p class="text-xs text-[#B9CACB]">Solo salas públicas disponibles</p>
          <button
            class="font-pixel text-[10px] text-[#7DF4FF] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!multiplayerStore.connected"
            @click="refreshPublicRooms"
          >
            ACTUALIZAR ↻
          </button>
        </div>
      </div>

      <div v-if="!hasPublicRooms" class="grid h-[590px] place-items-center text-center">
        <p class="font-pixel text-sm text-[#B9CACB]">
          {{
            multiplayerStore.connected
              ? 'NO HAY PARTIDAS PÚBLICAS DISPONIBLES'
              : 'CONECTANDO CON EL SERVIDOR…'
          }}
        </p>
      </div>

      <div v-else class="h-[590px] space-y-3 overflow-y-auto pr-2">
        <article
          v-for="room in multiplayerStore.publicRooms"
          :key="room.code"
          class="flex items-center justify-between rounded-md border border-[#53f4ff]/20 bg-[#080e20]/70 p-4"
        >
          <div>
            <h3 class="font-pixel text-sm text-[#7DF4FF]">SALA {{ room.code }}</h3>
            <p class="mt-2 text-xs text-[#B9CACB]">
              {{ room.username }} · {{ room.playerCount }}/5 jugadores
            </p>
          </div>
          <button
            class="rounded border border-[#7DF4FF] px-4 py-2 font-pixel text-xs text-[#7DF4FF] transition-colors hover:bg-[#7DF4FF] hover:text-[#080e20] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!multiplayerStore.connected"
            @click="joinRoom(room.code)"
          >
            UNIRSE
          </button>
        </article>
      </div>
    </section>
  </div>
</template>
