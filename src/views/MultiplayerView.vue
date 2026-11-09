<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMultiplayerStore } from '@/stores/multiplayer'
import { useCharacterStore } from '@/stores/characters'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const authStore = useAuthStore()
const multiplayerStore = useMultiplayerStore()
const characterStore = useCharacterStore()
const gameStore = useGameStore()

const roomCodeInput = ref('')
const roomFilter = ref('public')
const username = computed(() => authStore.user?.username?.trim() || '')
const hasRooms = computed(() => multiplayerStore.roomList.length > 0)
let characterLoadPromise = Promise.resolve()

async function getEquippedCharacterId() {
  await characterLoadPromise
  const characterId = characterStore.equippedCharacterId || gameStore.selectedCharacterId
  const validCharacterId = ['cosa1', 'cosa2', 'cosa3'].includes(characterId)
    ? characterId
    : 'cosa1'
  gameStore.equipCharacter(validCharacterId)
  return validCharacterId
}

onMounted(() => {
  multiplayerStore.setUsername(username.value)
  multiplayerStore.connect()
  roomFilter.value = 'public'
  multiplayerStore.fetchRooms('public')
  characterLoadPromise = characterStore
    .fetchUnlocked()
    .then(() => {
      const characterId = characterStore.equippedCharacterId
      if (['cosa1', 'cosa2', 'cosa3'].includes(characterId)) {
        gameStore.equipCharacter(characterId)
      }
    })
    .catch(() => null)
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

async function crearSala() {
  if (!username.value) {
    alert('Por favor inicia sesión para crear una sala')
    return
  }

  if (!multiplayerStore.connected) {
    multiplayerStore.actionError = 'El servidor no está conectado. Espera la conexión e inténtalo de nuevo.'
    multiplayerStore.connect()
    return
  }

  const isPrivate = roomFilter.value === 'friends'
  const roomName = `${isPrivate ? 'Sala privada' : 'Sala'} de ${username.value}`
  const characterId = await getEquippedCharacterId()

  multiplayerStore.limpiarChat()
  multiplayerStore.createRoom(username.value, isPrivate, roomName, 4, [], characterId)
}

async function joinRoom(roomCode = roomCodeInput.value) {
  if (!username.value) {
    alert('Por favor inicia sesión para entrar a una sala')
    return
  }

  if (!roomCode?.trim()) {
    alert('Ingresa un código de invitación o elige una sala pública')
    return
  }

  multiplayerStore.limpiarChat()
  const characterId = await getEquippedCharacterId()
  multiplayerStore.joinRoom(roomCode, username.value, characterId)
}

function refreshRooms() {
  multiplayerStore.fetchRooms(roomFilter.value)
}

function selectRoomFilter(filter) {
  roomFilter.value = filter
  multiplayerStore.fetchRooms(filter)
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

    <div class="multiplayer-layout">
      <section
        class="private-lobby-panel flex w-full min-w-0 flex-col rounded-lg bg-[#190C2D]/80 p-8 backdrop-blur-sm"
        aria-labelledby="create-room-title"
      >
        <h1 id="create-room-title" class="mb-4 text-center font-pixel text-[#00f7ff]">
          CREAR O UNIRSE
        </h1>

        <fieldset class="mt-8 room-create-visibility">
          <legend class="mb-2 font-pixel text-[9px] text-[#D1BCFF]">
            VISIBILIDAD DE LA SALA
          </legend>
          <div class="grid gap-1.5">
            <label
              class="room-visibility-option flex cursor-pointer items-start gap-2 rounded border px-2 py-1.5 text-left transition"
              :class="roomFilter === 'friends' ? 'is-selected is-private' : ''"
            >
              <input
                type="radio"
                name="room-filter"
                value="friends"
                class="room-radio mt-0.5"
                :checked="roomFilter === 'friends'"
                :disabled="!multiplayerStore.connected"
                @change="selectRoomFilter('friends')"
              />
              <span class="min-w-0">
                <span class="block font-pixel text-[10px]">PRIVADA</span>
                <span class="mt-0.5 block font-mono text-[7px] leading-relaxed text-white/55">
                  No aparece en públicas; comparte el código para entrar.
                </span>
              </span>
            </label>
            <label
              class="room-visibility-option flex cursor-pointer items-start gap-2 rounded border px-2 py-1.5 text-left transition"
              :class="roomFilter === 'public' ? 'is-selected is-public' : ''"
            >
              <input
                type="radio"
                name="room-filter"
                value="public"
                class="room-radio mt-0.5"
                :checked="roomFilter === 'public'"
                :disabled="!multiplayerStore.connected"
                @change="selectRoomFilter('public')"
              />
              <span class="min-w-0">
                <span class="block font-pixel text-[10px]">PÚBLICA</span>
                <span class="mt-0.5 block font-mono text-[7px] leading-relaxed text-white/55">
                  Aparece en el buscador mientras tenga cupos.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <button
          class="room-create-button h-[42px] rounded border-2 border-[#53f4ff] font-pixel text-[10px] text-[#53f4ff] transition-all hover:bg-[#53f4ff] hover:text-[#080e20] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!multiplayerStore.connected"
          @click="crearSala"
        >
          CREAR SALA {{ roomFilter === 'friends' ? 'PRIVADA' : 'PÚBLICA' }}
        </button>

        <p v-if="multiplayerStore.actionError" class="mt-2 text-center text-xs text-rose-200" role="alert">
          {{ multiplayerStore.actionError }}
        </p>

        <div class="my-3 h-px bg-white/15"></div>

        <label for="room-code" class="mt-10 mb-2 font-pixel text-[12px] text-[#D1BCFF]">
          CÓDIGO DE INVITACIÓN
        </label>
        <input
          id="room-code"
          v-model="roomCodeInput"
          type="text"
          maxlength="8"
          autocomplete="off"
          placeholder="CÓDIGO DE 8 CARACTERES"
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
        class="server-browser-panel flex w-full min-w-0 flex-col rounded-lg border border-[#3B494B] bg-[#190C2D]/80 p-5 backdrop-blur-sm"
        aria-labelledby="public-rooms-title"
      >
        <div class="mb-4 border-b border-[#4A4A6A] pb-4">
          <h2 id="public-rooms-title" class="font-pixel text-[20px] text-[#ECDCFF]">
            BUSCADOR DE PARTIDAS
          </h2>
          <div class="mt-2 flex items-center justify-between gap-4">
            <p class="font-mono text-[8px] text-[#B9CACB]">
              {{ roomFilter === 'public' ? 'Solo salas públicas disponibles' : 'Salas privadas compartidas contigo' }}
            </p>
            <button
              class="font-pixel text-[10px] text-[#7DF4FF] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!multiplayerStore.connected"
              @click="refreshRooms"
            >
              ACTUALIZAR ↻
            </button>
          </div>
        </div>

        <div
          v-if="!hasRooms"
          class="server-browser-empty grid h-[590px] place-items-center text-center"
        >
          <p class="font-pixel text-sm text-[#B9CACB]">
            {{
              multiplayerStore.connected
                ? roomFilter === 'public'
                  ? 'NO HAY SALAS PÚBLICAS DISPONIBLES'
                  : 'NO HAY SALAS PRIVADAS COMPARTIDAS CONTIGO'
                : 'CONECTANDO CON EL SERVIDOR…'
            }}
          </p>
        </div>

        <div v-else class="server-browser-list min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          <article
            v-for="room in multiplayerStore.roomList"
            :key="room.code"
            class="flex items-center justify-between rounded-md border border-[#53f4ff]/20 bg-[#080e20]/70 p-4"
          >
            <div>
              <h3 class="font-pixel text-sm text-[#7DF4FF]">{{ room.name }}</h3>
              <p class="mt-2 text-xs text-[#B9CACB]">
                CÓDIGO {{ room.code }} · {{ room.username }} · {{ room.playerCount }}/{{ room.maxPlayers }} jugadores
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
  </div>
</template>

<style scoped>
.multiplayer-screen {
  display: block !important;
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  padding: 0 !important;
}

.multiplayer-layout {
  display: contents;
}

.multiplayer-screen .private-lobby-panel {
  position: absolute !important;
  inset: auto !important;
  top: 100px !important;
  left: 250px !important;
  right: auto !important;
  width: 463px !important;
  min-width: 463px;
  height: 720px !important;
  max-height: calc(100dvh - 100px);
  margin: 0 !important;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 32px !important;
}

.multiplayer-screen .server-browser-panel {
  position: absolute !important;
  inset: auto !important;
  top: 80px !important;
  right: 200px !important;
  left: auto !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 793px !important;
  min-width: 793px;
  height: 720px !important;
  max-height: calc(100dvh - 100px);
  padding: 20px !important;
}

.room-radio {
  width: 12px;
  height: 12px;
  min-width: 12px;
  flex: 0 0 12px;
  appearance: none;
  border: 2px solid rgb(255 255 255 / 75%);
  border-radius: 50%;
  background: transparent;
}

.room-radio:checked {
  border-color: #53f4ff;
  background: #53f4ff;
  box-shadow: inset 0 0 0 2px #190c2d;
}

.room-radio:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.room-visibility-option.is-private:has(.room-radio:checked) .room-radio {
  border-color: #e879f9;
  background: #e879f9;
}

.room-create-button {
  width: 100%;
  flex: 0 0 auto;
}

.server-browser-panel > div:first-child {
  flex: 0 0 auto;
}

.server-browser-empty,
.server-browser-list {
  width: 100%;
  min-height: 0;
  flex: 1 1 auto;
  height: auto !important;
  max-height: none;
}

.server-browser-empty {
  display: grid;
  place-items: center;
}

.server-browser-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.server-browser-list > article {
  min-width: 0;
  flex: 0 0 auto;
  gap: 10px;
  padding: 16px;
}

.server-browser-list > article > div {
  min-width: 0;
  overflow-wrap: anywhere;
}

.multiplayer-back {
  top: 24px !important;
  left: 24px !important;
  font-size: 13px !important;
}

.private-lobby-panel h1,
.server-browser-panel h2 {
  font-size: 16px;
  line-height: normal;
  overflow-wrap: anywhere;
}

.server-browser-panel h2 {
  font-size: 20px;
}

@media (max-width: 1706px) and (min-width: 701px) {
  .multiplayer-screen {
    overflow: hidden;
  }

  .multiplayer-layout {
    display: grid;
    grid-template-columns: minmax(0, 463px) minmax(0, 793px);
    align-items: start;
    justify-content: center;
    gap: clamp(12px, 2vw, 36px);
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 64px 18px 18px;
  }

  .multiplayer-screen .private-lobby-panel,
  .multiplayer-screen .server-browser-panel {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    min-width: 0;
    max-width: none;
    margin: 0 !important;
    padding: clamp(12px, 2vw, 22px) !important;
  }

  .multiplayer-screen .private-lobby-panel {
    height: min(720px, calc(100dvh - 82px)) !important;
    max-height: calc(100dvh - 82px);
    overflow-y: auto;
  }

  .multiplayer-screen .server-browser-panel {
    height: min(720px, calc(100dvh - 82px)) !important;
    max-height: calc(100dvh - 82px);
  }

  .private-lobby-panel h1,
  .server-browser-panel h2 {
    font-size: clamp(12px, 1.5vw, 18px);
  }

  .server-browser-panel h2 {
    font-size: clamp(14px, 1.7vw, 20px);
  }
}

@media (max-width: 700px) {
  .multiplayer-screen {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    box-sizing: border-box;
    overflow-x: clip;
    overflow-y: auto !important;
    overscroll-behavior: contain;
  }

  .multiplayer-layout {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(10px, 2vh, 16px);
    width: 100%;
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    box-sizing: border-box;
    padding: clamp(56px, 9vh, 68px) clamp(10px, 3vw, 16px)
      max(env(safe-area-inset-bottom), 12px);
  }

  .multiplayer-screen .private-lobby-panel,
  .multiplayer-screen .server-browser-panel {
    position: relative !important;
    inset: auto !important;
    width: min(100%, 560px) !important;
    max-width: 100%;
    box-sizing: border-box;
    height: auto !important;
    flex: 0 0 auto;
    margin-inline: auto !important;
  }

  .multiplayer-screen .private-lobby-panel {
    overflow: visible;
    margin-top: clamp(24px, 5vh, 42px) !important;
    padding: clamp(14px, 4vw, 22px) !important;
    border: 1px solid rgb(83 244 255 / 24%);
  }

  .private-lobby-panel h1,
  .server-browser-panel h2 {
    margin-bottom: clamp(10px, 2.5vw, 16px) !important;
    font-size: clamp(11px, 3.3vw, 15px) !important;
    line-height: 1.45;
  }

  .private-lobby-panel > button {
    width: 100% !important;
    margin-left: 0 !important;
    min-height: 42px;
    font-size: clamp(8px, 2.4vw, 11px) !important;
  }

  .private-lobby-panel label,
  .private-lobby-panel > p {
    font-size: clamp(8px, 2.3vw, 10px) !important;
    line-height: 1.5;
  }

  .private-lobby-panel input {
    min-width: 0;
    padding-inline: 8px !important;
    font-size: 12px !important;
  }

  .multiplayer-screen .server-browser-panel {
    height: auto !important;
    min-height: 220px !important;
    overflow: hidden;
    padding: clamp(12px, 3vw, 18px) !important;
  }

  .server-browser-empty,
  .server-browser-list {
    min-height: 120px;
    max-height: 34dvh;
    flex: 0 1 auto;
  }

  .server-browser-empty {
    display: grid;
  }

  .server-browser-list > article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    padding: clamp(8px, 2.5vw, 12px) !important;
  }

  .server-browser-list > article h3 {
    font-size: clamp(9px, 2.5vw, 12px) !important;
    overflow-wrap: anywhere;
  }

  .server-browser-list > article p {
    font-size: clamp(8px, 2.1vw, 10px) !important;
    overflow-wrap: anywhere;
  }

  .server-browser-list > article button {
    padding: 6px 8px !important;
    font-size: clamp(7px, 1.9vw, 9px) !important;
  }

  .multiplayer-back {
    font-size: clamp(8px, 2.2vw, 11px) !important;
  }
}

@media (max-height: 620px) and (min-width: 701px) {
  .multiplayer-screen {
    overflow: hidden;
  }

  .multiplayer-layout {
    padding-top: 52px;
    padding-bottom: 12px;
  }

  .private-lobby-panel,
  .server-browser-panel {
    height: calc(100dvh - 76px) !important;
    padding: 12px !important;
  }

  .private-lobby-panel h1 {
    margin-bottom: 10px !important;
  }

  .private-lobby-panel fieldset {
    gap: 6px;
  }

  .private-lobby-panel fieldset label {
    padding: 8px;
  }

  .private-lobby-panel > button {
    height: 40px !important;
    margin-top: 8px !important;
  }

  .private-lobby-panel > div {
    margin-block: 8px !important;
  }
}

.room-visibility-option {
  min-height: 48px;
  border-color: rgb(255 255 255 / 15%);
  background: rgb(0 0 0 / 20%);
  color: rgb(255 255 255 / 78%);
}

.room-visibility-option:hover:not(:disabled) {
  border-color: rgb(83 244 255 / 70%);
}

.room-visibility-option.is-selected.is-public {
  border-color: #53f4ff;
  background: rgb(83 244 255 / 10%);
  color: #e8fcff;
}

.room-visibility-option.is-selected.is-private {
  border-color: #e879f9;
  background: rgb(232 121 249 / 10%);
  color: #fce7ff;
}

.room-visibility-option:focus-visible {
  outline: 2px solid #53f4ff;
  outline-offset: 2px;
}

@media (max-width: 700px) {
  .multiplayer-screen .server-browser-panel {
    position: relative !important;
    inset: auto !important;
    top: auto !important;
    right: auto !important;
    left: auto !important;
    transform: none !important;
    width: min(92vw, 360px) !important;
    max-width: 360px !important;
    height: auto !important;
    max-height: 52dvh !important;
    min-height: 0 !important;
    margin: 0 2vw 0 auto !important;
    padding: clamp(9px, 2.5vw, 14px) !important;
  }

  .multiplayer-screen .server-browser-panel > div:first-child {
    width: 100% !important;
    margin: 0 0 7px !important;
    padding-bottom: 7px !important;
  }

  .multiplayer-screen .server-browser-panel h2 {
    margin-bottom: 4px !important;
    font-size: clamp(9px, 2.8vw, 12px) !important;
  }

  .multiplayer-screen .room-visibility-option {
    min-height: 36px !important;
    padding: 5px 7px !important;
  }

  .multiplayer-screen .room-visibility-option > span:last-child > span:first-child {
    font-size: clamp(7px, 2vw, 9px) !important;
  }

  .multiplayer-screen .room-visibility-option > span:last-child > span:last-child {
    margin-top: 2px !important;
    font-size: clamp(6px, 1.7vw, 8px) !important;
    line-height: 1.3 !important;
  }

  .multiplayer-screen .server-browser-empty {
    height: auto !important;
    min-height: 58px !important;
    flex: 0 0 auto !important;
  }

  .multiplayer-screen .server-browser-empty p {
    font-size: clamp(7px, 2vw, 9px) !important;
  }
}

@media (any-pointer: coarse) and (orientation: landscape) and (max-height: 500px) {
  .multiplayer-screen {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }

  .multiplayer-layout {
    display: grid !important;
    grid-template-columns: minmax(0, 0.58fr) minmax(0, 1fr) !important;
    align-items: stretch !important;
    gap: clamp(7px, 1.6vw, 14px) !important;
    width: 96% !important;
    height: 96dvh !important;
    margin: 2dvh auto 0 !important;
    box-sizing: border-box;
    padding: 52px 12px 10px !important;
  }

  .multiplayer-screen .private-lobby-panel,
  .multiplayer-screen .server-browser-panel {
    position: relative !important;
    inset: auto !important;
    top: auto !important;
    right: auto !important;
    left: auto !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    margin: 0 !important;
    box-sizing: border-box;
  }

  .multiplayer-screen .private-lobby-panel {
    gap: 0 !important;
    overflow: hidden !important;
    padding: 10px !important;
  }

  .multiplayer-screen .private-lobby-panel h1 {
    margin: 0 0 4px !important;
    font-size: clamp(9px, 1.5vw, 13px) !important;
    line-height: 1.25 !important;
  }

  .multiplayer-screen .private-lobby-panel fieldset {
    min-width: 0;
    margin: 4px 0 0 !important;
  }

  .multiplayer-screen .private-lobby-panel legend {
    margin-bottom: 3px !important;
    font-size: clamp(7px, 1.1vw, 9px) !important;
  }

  .multiplayer-screen .private-lobby-panel .room-visibility-option {
    min-height: 27px !important;
    padding: 3px 5px !important;
  }

  .multiplayer-screen .private-lobby-panel .room-visibility-option > span > span:last-child {
    margin-top: 1px !important;
    font-size: clamp(5px, 0.75vw, 7px) !important;
    line-height: 1.15 !important;
  }

  .multiplayer-screen .private-lobby-panel .room-create-button {
    height: 31px !important;
    min-height: 31px !important;
    margin-top: 3px !important;
    font-size: clamp(7px, 1vw, 9px) !important;
  }

  .multiplayer-screen .private-lobby-panel > div {
    margin-block: 5px !important;
  }

  .multiplayer-screen .private-lobby-panel > label[for='room-code'] {
    margin: 2px 0 3px !important;
    font-size: clamp(7px, 1.1vw, 9px) !important;
  }

  .multiplayer-screen .private-lobby-panel #room-code {
    height: 32px !important;
    min-height: 32px !important;
    padding-inline: 6px !important;
    font-size: clamp(8px, 1.1vw, 11px) !important;
  }

  .multiplayer-screen .private-lobby-panel > button:not(.room-create-button) {
    height: 34px !important;
    min-height: 34px !important;
    margin-top: 6px !important;
    font-size: clamp(8px, 1.15vw, 10px) !important;
  }

  .multiplayer-screen .private-lobby-panel > p[aria-live] {
    margin-top: 5px !important;
    font-size: clamp(6px, 0.9vw, 8px) !important;
    line-height: 1.2 !important;
  }

  .multiplayer-screen .server-browser-panel {
    overflow: hidden !important;
    padding: 12px !important;
  }

  .multiplayer-screen .server-browser-panel > div:first-child {
    margin-bottom: 6px !important;
    padding-bottom: 6px !important;
  }

  .multiplayer-screen .server-browser-panel h2 {
    margin-bottom: 3px !important;
    font-size: clamp(10px, 1.7vw, 15px) !important;
  }

  .multiplayer-screen .server-browser-panel > div:first-child p,
  .multiplayer-screen .server-browser-panel > div:first-child button {
    font-size: clamp(6px, 0.9vw, 8px) !important;
  }

  .multiplayer-screen .server-browser-empty,
  .multiplayer-screen .server-browser-list {
    min-height: 0 !important;
    max-height: none !important;
    flex: 1 1 auto !important;
  }

  .multiplayer-screen .server-browser-empty {
    height: auto !important;
  }

  .multiplayer-screen .server-browser-empty p {
    font-size: clamp(7px, 1vw, 9px) !important;
  }
}
</style>
