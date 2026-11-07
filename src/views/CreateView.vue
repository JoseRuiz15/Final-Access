<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMultiplayerStore } from '@/stores/multiplayer'

const router = useRouter()
const authStore = useAuthStore()
const multiplayerStore = useMultiplayerStore()

const roomName = ref('')
const friendUsernames = ref('')
const privacyOption = ref('public')
const maxPlayers = ref(4)
const roomFilter = ref('public')
const playerCapacities = [2, 3, 4, 5, 6, 7, 8, 9, 10]
const username = computed(() => authStore.user?.username?.trim() || '')
const hasRooms = computed(() => multiplayerStore.roomList.length > 0)

onMounted(() => {
  multiplayerStore.setUsername(username.value)
  multiplayerStore.fetchRooms('public')
  multiplayerStore.connect()
})

watch(
  () => multiplayerStore.roomCode,
  (roomCode) => {
    if (roomCode) router.push('/lobby-room')
  },
)

function goBack() {
  router.push('/multiplayer')
}

function selectRoomFilter(filter) {
  roomFilter.value = filter
  multiplayerStore.fetchRooms(filter)
}

function refreshRooms() {
  multiplayerStore.fetchRooms(roomFilter.value)
}

function joinRoom(roomCode) {
  if (!username.value) {
    multiplayerStore.actionError = 'Inicia sesión para entrar a una sala.'
    return
  }

  if (!multiplayerStore.connected) {
    multiplayerStore.actionError = 'El servidor no está conectado. Espera la conexión e inténtalo de nuevo.'
    multiplayerStore.connect()
    return
  }

  multiplayerStore.limpiarChat()
  multiplayerStore.joinRoom(roomCode, username.value)
}

function createRoom() {
  if (!username.value) {
    multiplayerStore.actionError = 'Inicia sesión para crear una sala.'
    return
  }

  if (!roomName.value.trim()) {
    multiplayerStore.actionError = 'Escribe un nombre para la sala.'
    return
  }

  if (!multiplayerStore.connected) {
    multiplayerStore.actionError = 'El servidor no está conectado. Espera la conexión e inténtalo de nuevo.'
    multiplayerStore.connect()
    return
  }

  multiplayerStore.limpiarChat()
  multiplayerStore.createRoom(
    username.value,
    privacyOption.value === 'private',
    roomName.value.trim(),
    maxPlayers.value,
    friendUsernames.value
      .split(/[,;\n]/)
      .map((friend) => friend.trim())
      .filter(Boolean),
  )
}
</script>

<template>
  <main class="create-game-screen relative isolate min-h-screen bg-[#080e20] text-white">
    <img
      src="/img/multy-player/partida.webp"
      alt=""
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 -z-10 h-full w-full object-cover"
    />
    <button
      type="button"
      class="absolute left-5 top-5 z-10 font-pixel text-xs text-white transition hover:text-fuchsia-300 sm:left-8 sm:top-8"
      @click="goBack"
    >
      VOLVER
    </button>

    <div class="create-game-shell mx-auto grid min-h-screen w-full max-w-6xl items-center gap-4 px-4 py-20 sm:px-8">
      <section
        class="create-game-panel w-full rounded-lg border border-[#3B494B] bg-[#190C2D]/80 p-5 shadow-[0_0_60px_#00d9ff22] backdrop-blur-sm sm:p-9"
        aria-labelledby="create-game-title"
      >
        <header class="create-game-header mb-7 border-b border-white/10 pb-5 text-center">
          <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-100/60">
            Final Access / Multijugador
          </p>
          <h1 id="create-game-title" class="font-pixel text-xl leading-relaxed text-cyan-100 sm:text-2xl">
            CREAR PARTIDA
          </h1>
          <p class="mt-3 font-mono text-xs text-white/55">
            Configura tu sala y comparte el código con tus amigos.
          </p>
        </header>

        <div class="create-game-fields grid gap-6 sm:grid-cols-2">
          <label class="block sm:col-span-2" for="room-name">
            <span class="mb-2 block font-pixel text-[10px] text-cyan-100">NOMBRE DE LA SALA</span>
            <input
              id="room-name"
              v-model="roomName"
              type="text"
              maxlength="64"
              autocomplete="off"
              placeholder="Ej. Escuadrón nocturno"
              class="h-12 w-full rounded border border-white/15 bg-[#06093d]/70 px-4 font-mono text-sm text-white outline-none transition focus:border-cyan-200"
            />
          </label>

          <fieldset class="sm:col-span-2">
            <legend class="mb-3 font-pixel text-[10px] text-cyan-100">VISIBILIDAD DE LA SALA</legend>
            <div class="grid gap-3 sm:grid-cols-2">
              <label
                class="flex cursor-pointer items-center gap-3 border p-4 transition"
                :class="privacyOption === 'public' ? 'border-cyan-200 bg-cyan-400/10' : 'border-white/15 bg-black/20'"
              >
                <input
                  v-model="privacyOption"
                  type="radio"
                  name="room-privacy"
                  value="public"
                  class="h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-white/70 bg-transparent transition checked:border-cyan-300 checked:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100"
                />
                <span class="font-pixel text-[10px]">PÚBLICA</span>
              </label>
              <label
                class="flex cursor-pointer items-center gap-3 border p-4 transition"
                :class="privacyOption === 'private' ? 'border-fuchsia-300 bg-fuchsia-400/10' : 'border-white/15 bg-black/20'"
              >
                <input
                  v-model="privacyOption"
                  type="radio"
                  name="room-privacy"
                  value="private"
                  class="h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-white/70 bg-transparent transition checked:border-fuchsia-300 checked:bg-fuchsia-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-100"
                />
                <span class="font-pixel text-[10px]">PRIVADA</span>
              </label>
            </div>
            <p class="mt-2 font-mono text-[10px] leading-relaxed text-white/45">
              {{ privacyOption === 'private' ? 'Solo se puede entrar con el código.' : 'Aparecerá en el buscador de salas públicas.' }}
            </p>
            <label v-if="privacyOption === 'private'" class="mt-4 block" for="room-friends">
              <span class="mb-2 block font-pixel text-[9px] text-fuchsia-100">AMIGOS QUE PUEDEN VERLA</span>
              <textarea
                id="room-friends"
                v-model="friendUsernames"
                rows="2"
                maxlength="300"
                placeholder="Escribe sus usuarios separados por coma"
                class="w-full resize-y rounded border border-white/15 bg-[#06093d]/70 px-3 py-2 font-mono text-xs text-white outline-none focus:border-fuchsia-200"
              ></textarea>
              <span class="mt-2 block font-mono text-[9px] text-white/45">
                Solo esos usuarios verán la sala en “Privadas de amigos”. También podrán entrar con el código.
              </span>
            </label>
          </fieldset>

          <label for="room-capacity">
            <span class="mb-3 block font-pixel text-[10px] text-cyan-100">JUGADORES ADMITIDOS</span>
            <select
              id="room-capacity"
              v-model.number="maxPlayers"
              class="h-12 w-full rounded border border-white/15 bg-[#06093d]/70 px-4 font-mono text-sm text-white outline-none focus:border-cyan-200"
            >
              <option v-for="capacity in playerCapacities" :key="capacity" :value="capacity">
                {{ capacity }} jugadores
              </option>
            </select>
            <span class="mt-2 block font-mono text-[10px] text-white/45">Mínimo 2, máximo 10.</span>
          </label>
        </div>

        <p v-if="multiplayerStore.actionError" class="mt-5 text-center font-mono text-xs text-rose-200" role="alert">
          {{ multiplayerStore.actionError }}
        </p>

        <button
          type="button"
          class="create-room-submit mt-7 h-14 w-full border border-cyan-200 bg-cyan-200 font-pixel text-xs text-[#080e20] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!roomName.trim()"
          @click="createRoom"
        >
          CREAR SALA
        </button>

        <p
          class="mt-4 text-center font-mono text-[10px]"
          :class="multiplayerStore.connected ? 'text-cyan-100/60' : 'text-rose-200'"
          role="status"
        >
          {{ multiplayerStore.connected ? 'Servidor conectado' : multiplayerStore.connectionError || 'Conectando…' }}
        </p>
      </section>

      <section
        class="create-room-browser flex w-full min-w-0 flex-col rounded-lg border border-[#3B494B] bg-[#190C2D]/80 p-5 shadow-[0_0_60px_#00d9ff22] backdrop-blur-sm"
        aria-labelledby="create-room-browser-title"
      >
        <header class="create-room-browser-header mb-4 border-b border-white/10 pb-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="mb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-cyan-100/55">
                Explora partidas
              </p>
              <h2 id="create-room-browser-title" class="font-pixel text-sm text-cyan-100">
                SALAS CREADAS
              </h2>
            </div>
            <button
              type="button"
              class="font-pixel text-[8px] text-cyan-200 transition hover:text-white disabled:opacity-40"
              :disabled="!multiplayerStore.connected"
              @click="refreshRooms"
            >
              ACTUALIZAR ↻
            </button>
          </div>

          <div class="mt-4 grid gap-2" role="group" aria-label="Filtrar salas">
            <button
              type="button"
              class="create-room-filter flex w-full items-start gap-2 rounded border px-3 py-2 text-left transition"
              :class="roomFilter === 'public' ? 'is-selected is-public' : ''"
              :aria-pressed="roomFilter === 'public'"
              :disabled="!multiplayerStore.connected"
              @click="selectRoomFilter('public')"
            >
              <span
                class="mt-0.5 h-3 w-3 shrink-0 rounded-full border-2"
                :class="roomFilter === 'public' ? 'border-cyan-300 bg-cyan-300' : 'border-white/70 bg-transparent'"
                aria-hidden="true"
              ></span>
              <span>
                <span class="block font-pixel text-[8px]">PÚBLICAS</span>
                <span class="mt-1 block font-mono text-[9px] leading-relaxed text-white/55">
                  Salas disponibles para todos.
                </span>
              </span>
            </button>
            <button
              type="button"
              class="create-room-filter flex w-full items-start gap-2 rounded border px-3 py-2 text-left transition"
              :class="roomFilter === 'friends' ? 'is-selected is-private' : ''"
              :aria-pressed="roomFilter === 'friends'"
              :disabled="!multiplayerStore.connected"
              @click="selectRoomFilter('friends')"
            >
              <span
                class="mt-0.5 h-3 w-3 shrink-0 rounded-full border-2"
                :class="roomFilter === 'friends' ? 'border-fuchsia-300 bg-fuchsia-300' : 'border-white/70 bg-transparent'"
                aria-hidden="true"
              ></span>
              <span>
                <span class="block font-pixel text-[8px]">PRIVADAS DE AMIGOS</span>
                <span class="mt-1 block font-mono text-[9px] leading-relaxed text-white/55">
                  Salas privadas compartidas contigo.
                </span>
              </span>
            </button>
          </div>
        </header>

        <div
          v-if="!hasRooms"
          class="create-room-browser-empty grid flex-1 place-items-center text-center"
        >
          <p class="font-pixel text-[9px] leading-relaxed text-white/55">
            {{
              multiplayerStore.connected
                ? roomFilter === 'public'
                  ? 'NO HAY SALAS PÚBLICAS DISPONIBLES'
                  : 'NO HAY SALAS PRIVADAS COMPARTIDAS CONTIGO'
                : multiplayerStore.connectionError || 'CONECTANDO CON EL SERVIDOR…'
            }}
          </p>
        </div>

        <div v-else class="create-room-browser-list min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          <article
            v-for="room in multiplayerStore.roomList"
            :key="room.code"
            class="flex min-w-0 items-center justify-between gap-3 rounded border border-cyan-200/15 bg-[#080e20]/65 p-3"
          >
            <div class="min-w-0">
              <h3 class="truncate font-pixel text-[9px] text-cyan-100">{{ room.name }}</h3>
              <p class="mt-2 break-words font-mono text-[9px] leading-relaxed text-white/55">
                CÓDIGO {{ room.code }} · {{ room.username }} · {{ room.playerCount }}/{{ room.maxPlayers }} jugadores
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded border border-cyan-200/70 px-3 py-2 font-pixel text-[8px] text-cyan-100 transition hover:bg-cyan-200 hover:text-[#080e20] disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!multiplayerStore.connected"
              @click="joinRoom(room.code)"
            >
              UNIRSE
            </button>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
@media (min-width: 701px) {
  .create-game-screen {
    height: 100vh;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
  }

  .create-game-shell {
    grid-template-columns: minmax(250px, 0.68fr) minmax(0, 1.32fr);
    align-items: stretch;
    gap: clamp(14px, 2vw, 26px);
    max-width: 1280px;
    min-height: 0;
    height: 100%;
    padding: 64px clamp(20px, 3vw, 44px) 18px !important;
  }

  .create-game-panel {
    width: min(100%, 400px);
    justify-self: start;
    max-height: calc(100dvh - 82px);
    overflow-y: auto;
    padding: 16px 22px !important;
  }

  .create-room-browser {
    width: 100%;
    min-height: 0;
    max-height: calc(100dvh - 82px);
    padding: clamp(12px, 1.8vw, 20px) !important;
    overflow: hidden;
  }

  .create-room-browser-header {
    flex: 0 0 auto;
  }

  .create-room-browser-empty,
  .create-room-browser-list {
    min-height: 0;
    flex: 1 1 auto;
  }

  .create-room-browser-list {
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .create-game-header {
    margin-bottom: 10px !important;
    padding-bottom: 8px !important;
  }

  .create-game-header > p:first-child {
    margin-bottom: 7px !important;
    font-size: 8px !important;
  }

  .create-game-header h1 {
    font-size: 14px !important;
  }

  .create-room-browser h2 {
    font-size: 11px !important;
    line-height: 1.4 !important;
  }

  .create-game-header > p:last-child {
    margin-top: 6px !important;
    font-size: 9px !important;
  }

  .create-game-fields {
    gap: 10px !important;
  }

  .create-game-fields label > span,
  .create-game-fields legend {
    margin-bottom: 5px !important;
    font-size: 8px !important;
  }

  .create-game-fields input:not([type='radio']),
  .create-game-fields select {
    height: 30px !important;
    font-size: 11px !important;
  }

  .create-game-fields fieldset > div label {
    padding: 8px 10px !important;
  }

  .create-game-fields fieldset > p,
  .create-game-fields label > span + span {
    margin-top: 4px !important;
    font-size: 8px !important;
  }

  .create-game-fields textarea {
    min-height: 34px;
    max-height: 40px;
    padding: 5px 8px !important;
    font-size: 10px !important;
  }

  .create-room-submit {
    height: 38px !important;
    margin-top: 12px !important;
    font-size: 10px !important;
  }
}

@media (max-width: 700px) {
  .create-game-screen {
    width: 100%;
    height: auto !important;
    min-height: 100vh;
    min-height: 100dvh;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }

  .create-game-shell {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    align-items: start;
    gap: clamp(10px, 2vh, 16px);
    padding: clamp(54px, 8vh, 66px) clamp(8px, 3vw, 16px)
      max(env(safe-area-inset-bottom), 6px) !important;
  }

  .create-game-panel {
    width: min(90%, 400px);
    max-height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    margin-inline: auto;
    padding: clamp(9px, 2.5vw, 14px) !important;
  }

  .create-room-browser {
    width: min(100%, 470px);
    min-height: 230px;
    max-height: 52dvh;
    margin-inline: auto;
    padding: clamp(10px, 3vw, 16px) !important;
    overflow: hidden;
  }

  .create-room-browser-header {
    margin-bottom: 8px !important;
    padding-bottom: 8px !important;
  }

  .create-room-browser-list {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .create-room-browser-list article {
    padding: clamp(7px, 2vw, 10px) !important;
  }

  .create-room-browser-list article p {
    font-size: clamp(7px, 2vw, 9px) !important;
  }

  .create-room-filter {
    min-height: 38px;
    padding: 6px 8px !important;
  }

  .create-room-filter > span:last-child > span:last-child {
    font-size: clamp(7px, 1.8vw, 9px) !important;
  }

  .create-game-header {
    margin-bottom: clamp(7px, 1.5vh, 11px) !important;
    padding-bottom: clamp(6px, 1.2vh, 9px) !important;
  }

  .create-game-header > p:first-child {
    margin-bottom: 4px !important;
    font-size: clamp(6px, 1.6vw, 8px) !important;
    letter-spacing: 0.18em;
  }

  .create-game-header h1 {
    font-size: clamp(10px, 3vw, 16px) !important;
  }

  .create-game-header > p:last-child {
    margin-top: 4px !important;
    font-size: clamp(7px, 1.8vw, 9px) !important;
  }

  .create-game-fields {
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(6px, 1vh, 9px) !important;
  }

  .create-game-fields label > span,
  .create-game-fields legend {
    font-size: clamp(7px, 1.8vw, 8px) !important;
    line-height: 1.25;
  }

  .create-game-fields input:not([type='radio']),
  .create-game-fields select {
    height: clamp(30px, 4.8vh, 38px) !important;
    min-width: 0;
    padding-inline: 10px !important;
    font-size: clamp(11px, 3vw, 14px) !important;
  }

  .create-game-fields fieldset > div {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px !important;
  }

  .create-game-fields fieldset > div label {
    min-width: 0;
    padding: clamp(5px, 1.5vw, 8px) !important;
  }

  .create-game-fields input[type='radio'] {
    width: 14px !important;
    height: 14px !important;
    min-width: 14px !important;
    min-height: 14px !important;
    flex: 0 0 14px !important;
    aspect-ratio: 1 / 1;
    border-radius: 50% !important;
  }

  .create-game-fields fieldset > div label span {
    font-size: clamp(7px, 2vw, 9px) !important;
  }

  .create-game-fields textarea {
    min-height: 38px;
    max-height: 46px;
    padding: 5px 7px !important;
    font-size: 10px !important;
  }

  .create-room-submit {
    height: clamp(34px, 5vh, 40px) !important;
    margin-top: clamp(8px, 1.5vh, 12px) !important;
    font-size: clamp(8px, 2vw, 10px) !important;
  }
}

@media (max-height: 560px) and (max-width: 700px) {
  .create-game-shell {
    padding-top: 36px !important;
  }

  .create-game-header {
    margin-bottom: 5px !important;
    padding-bottom: 4px !important;
  }

  .create-game-fields {
    gap: 5px !important;
  }

  .create-game-fields input:not([type='radio']),
  .create-game-fields select {
    height: 28px !important;
  }

  .create-room-submit {
    height: 30px !important;
    margin-top: 6px !important;
  }

  .create-game-fields textarea {
    min-height: 32px;
    max-height: 36px;
  }
}

.create-room-filter {
  min-width: 0;
  border-color: rgb(255 255 255 / 15%);
  background: rgb(0 0 0 / 20%);
  color: rgb(255 255 255 / 80%);
}

.create-room-filter:hover:not(:disabled) {
  border-color: rgb(83 244 255 / 70%);
}

.create-room-filter.is-selected.is-public {
  border-color: #53f4ff;
  background: rgb(83 244 255 / 10%);
  color: #e8fcff;
}

.create-room-filter.is-selected.is-private {
  border-color: #e879f9;
  background: rgb(232 121 249 / 10%);
  color: #fce7ff;
}

.create-room-filter:focus-visible {
  outline: 2px solid #53f4ff;
  outline-offset: 2px;
}
</style>
