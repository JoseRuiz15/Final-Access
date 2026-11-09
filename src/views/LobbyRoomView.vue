<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMultiplayerStore } from '@/stores/multiplayer'

const router = useRouter()
const multiplayerStore = useMultiplayerStore()

const newMessage = ref('')
const copyStatus = ref('')

onMounted(() => {
  // Asegurarnos de que esté conectado
  if (!multiplayerStore.connected) {
    multiplayerStore.connect()
  }
})

watch(
  () => multiplayerStore.gameStarted,
  (started) => {
    if (started && multiplayerStore.gameMap === 'level6') {
      router.replace({ name: 'multiplayer-game' })
    }
  },
  { immediate: true },
)

const sendChat = () => {
  if (newMessage.value.trim()) {
    multiplayerStore.sendMessage(newMessage.value)
    newMessage.value = ''
  }
}

const toggleReady = () => {
  multiplayerStore.setReady()
}

async function copyRoomCode() {
  try {
    await navigator.clipboard.writeText(multiplayerStore.roomCode)
    copyStatus.value = 'Código copiado'
  } catch {
    copyStatus.value = 'Copia el código mostrado arriba'
  }
}

const salirMultiplayer = () => {
  multiplayerStore.disconnect()
  router.push('/multiplayer')
}

const currentPlayer = computed(() => {
  return multiplayerStore.players.find((p) => p.id === multiplayerStore.socket?.id)
})
</script>

<template>
  <div class="lobby-room-screen relative isolate min-h-screen bg-[#080e20] text-white font-pixel">
    <img
      src="/img/multy-player/partida.webp"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />

    <div class="lobby-room-layout flex h-screen p-10 gap-10">
      <!-- Columna Izquierda: Jugadores -->
      <div class="lobby-room-players w-1/3 bg-[#190C2D]/80 backdrop-blur-md rounded-lg p-6 border border-[#53f4ff]/30">
        <div class="mb-6 flex flex-col items-center gap-3 text-center">
          <h1 class="break-words text-2xl text-[#53f4ff]">{{ multiplayerStore.roomName }}</h1>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              class="rounded border border-[#53f4ff]/50 bg-[#06093d]/70 px-3 py-2 text-sm text-white"
              aria-label="Copiar código de invitación"
              @click="copyRoomCode"
            >
              CÓDIGO: {{ multiplayerStore.roomCode }} · COPIAR
            </button>
            <span class="rounded border border-[#53f4ff]/40 px-2 py-1 text-[10px] text-[#D1BCFF]">
            {{ multiplayerStore.isPrivate ? 'PRIVADA' : 'PÚBLICA' }}
            </span>
          </div>
          <p class="text-xs text-[#D1BCFF]" aria-live="polite">
            {{ multiplayerStore.players.length }}/{{ multiplayerStore.maxPlayers }} jugadores
            <span v-if="copyStatus">· {{ copyStatus }}</span>
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <div
            v-for="player in multiplayerStore.players"
            :key="player.id"
            class="flex items-center justify-between p-3 bg-[#0C0C0C]/50 rounded-md border border-white/10"
          >
            <span class="text-lg">{{ player.username }}</span>
            <span :class="player.ready ? 'text-green-400' : 'text-red-400'" class="text-sm">
              {{ player.ready ? 'LISTO' : 'ESPERANDO' }}
            </span>
          </div>
        </div>

        <div class="mt-auto pt-10 flex justify-center">
          <button
            @click="toggleReady"
            :class="currentPlayer?.ready ? 'bg-green-600' : 'bg-[#53f4ff] text-black'"
            class="px-8 py-3 rounded-lg font-bold hover:scale-105 transition-all shadow-lg"
          >
            {{ currentPlayer?.ready ? 'CANCELAR LISTO' : 'ESTOY LISTO' }}
          </button>
        </div>
        <p class="mt-4 text-center text-xs text-[#D1BCFF]/80">
          La partida empieza cuando todos estén listos (mínimo 2 jugadores).
        </p>

        <!-- Botón de Salir añadido -->
        <div class="mt-6 flex justify-center">
          <button
            @click="salirMultiplayer"
            class="bg-red-500 text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition-all shadow-lg"
          >
            SALIR DE LA SALA
          </button>
        </div>
      </div>

      <!-- Columna Derecha: Chat -->
      <div
        class="lobby-room-chat w-2/3 bg-[#190C2D]/80 backdrop-blur-md rounded-lg p-6 border border-[#53f4ff]/30 flex flex-col"
      >
        <h2 class="text-[#53f4ff] text-2xl mb-6 text-center">CHAT DE LA SALA</h2>

        <div class="flex-1 overflow-y-auto mb-4 p-4 bg-[#0C0C0C]/50 rounded-md space-y-2">
          <div v-for="(msg, index) in multiplayerStore.messages" :key="index" class="text-sm">
            <span class="text-[#D1BCFF] font-bold">[{{ msg.time }}] {{ msg.username }}:</span>
            <span class="ml-2 text-gray-300">{{ msg.message }}</span>
          </div>
        </div>

        <div class="flex gap-2">
          <input
            v-model="newMessage"
            @keyup.enter="sendChat"
            type="text"
            placeholder="Escribe un mensaje..."
            class="flex-1 bg-[#06093d]/70 border border-[#53f4ff]/30 rounded-md p-3 text-white outline-none focus:border-[#53f4ff]"
          />
          <button
            @click="sendChat"
            class="bg-[#53f4ff] text-black px-6 py-3 rounded-md font-bold hover:bg-white transition-all"
          >
            ENVIAR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px), (pointer: coarse), (any-pointer: coarse) {
  .lobby-room-screen {
    width: 100%;
    min-height: 100svh;
    height: auto;
    overflow-x: hidden;
    overflow-y: auto;
    padding: max(8px, env(safe-area-inset-top)) 0 max(10px, env(safe-area-inset-bottom));
  }

  .lobby-room-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    min-height: 100svh;
    padding: 8px clamp(8px, 3vw, 14px) !important;
    gap: clamp(10px, 2vh, 16px) !important;
    box-sizing: border-box;
  }

  .lobby-room-players,
  .lobby-room-chat {
    width: 100% !important;
    min-width: 0;
    box-sizing: border-box;
    padding: clamp(12px, 3.5vw, 18px) !important;
  }

  .lobby-room-players {
    flex: 0 0 auto;
  }

  .lobby-room-players h1 {
    max-width: 100%;
    font-size: clamp(13px, 4vw, 20px) !important;
    overflow-wrap: anywhere;
  }

  .lobby-room-players > div > div button {
    max-width: 100%;
    overflow-wrap: anywhere;
    font-size: clamp(8px, 2.5vw, 11px) !important;
  }

  .lobby-room-players > div:nth-of-type(2) > div {
    gap: 8px;
    padding: 8px !important;
  }

  .lobby-room-players > div:nth-of-type(2) > div span {
    min-width: 0;
    font-size: clamp(8px, 2.5vw, 11px) !important;
    overflow-wrap: anywhere;
  }

  .lobby-room-chat {
    height: min(52svh, 420px);
    min-height: 260px;
    flex: 0 0 auto;
  }

  .lobby-room-chat h2 {
    margin-bottom: 12px !important;
    font-size: clamp(12px, 3.8vw, 18px) !important;
  }

  .lobby-room-chat input {
    min-width: 0;
    font-size: 16px !important;
  }

  .lobby-room-chat > div:last-child button {
    flex: 0 0 auto;
    padding-inline: clamp(10px, 3vw, 18px) !important;
    font-size: clamp(8px, 2.3vw, 10px) !important;
  }
}

@media (orientation: landscape) and (max-height: 500px) and (pointer: coarse),
  (orientation: landscape) and (max-height: 500px) and (any-pointer: coarse) {
  .lobby-room-layout {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    align-items: stretch;
    min-height: 100svh;
  }

  .lobby-room-players,
  .lobby-room-chat {
    height: calc(100svh - 16px);
    min-height: 0;
  }
}

@media (orientation: landscape) and (max-height: 500px) and (pointer: coarse),
  (orientation: landscape) and (max-height: 500px) and (any-pointer: coarse) {
  .lobby-room-screen {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    min-height: 0 !important;
    overflow: hidden !important;
    padding: 0 !important;
  }

  .lobby-room-layout {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) !important;
    align-items: stretch !important;
    width: 100% !important;
    height: 100dvh !important;
    min-height: 0 !important;
    gap: clamp(8px, 1.8vw, 16px) !important;
    box-sizing: border-box;
    padding: clamp(8px, 2vh, 14px) clamp(8px, 1.5vw, 16px) !important;
  }

  .lobby-room-players,
  .lobby-room-chat {
    width: auto !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    box-sizing: border-box;
    padding: clamp(8px, 1.4vw, 14px) !important;
  }

  .lobby-room-players {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .lobby-room-players > div:first-child {
    gap: clamp(4px, 1vh, 7px) !important;
    margin-bottom: clamp(6px, 1.5vh, 10px) !important;
  }

  .lobby-room-players h1 {
    font-size: clamp(10px, 1.65vw, 15px) !important;
    line-height: 1.2 !important;
  }

  .lobby-room-players > div:first-child > div:nth-child(2) {
    gap: 5px !important;
  }

  .lobby-room-players > div:first-child > div:nth-child(2) button {
    max-width: 100%;
    padding: 4px 7px !important;
    font-size: clamp(6px, 0.95vw, 9px) !important;
    line-height: 1.2;
    white-space: nowrap;
  }

  .lobby-room-players > div:first-child > div:nth-child(2) span {
    padding: 3px 5px !important;
    font-size: clamp(6px, 0.8vw, 8px) !important;
  }

  .lobby-room-players > div:first-child > p {
    font-size: clamp(7px, 1vw, 9px) !important;
  }

  .lobby-room-players > div:nth-child(2) {
    gap: clamp(4px, 1vh, 7px) !important;
  }

  .lobby-room-players > div:nth-child(2) > div {
    gap: 6px !important;
    padding: 5px 7px !important;
  }

  .lobby-room-players > div:nth-child(2) > div span:first-child {
    font-size: clamp(8px, 1.2vw, 11px) !important;
  }

  .lobby-room-players > div:nth-child(2) > div span:last-child {
    font-size: clamp(7px, 0.95vw, 9px) !important;
  }

  .lobby-room-players > div:nth-child(3) {
    padding-top: 0 !important;
  }

  .lobby-room-players > div:nth-child(3) button,
  .lobby-room-players > div:nth-child(5) button {
    padding: 5px 10px !important;
    font-size: clamp(8px, 1.15vw, 10px) !important;
    line-height: 1.2;
  }

  .lobby-room-players > p {
    margin-top: 6px !important;
    font-size: clamp(6px, 0.95vw, 8px) !important;
    line-height: 1.25 !important;
  }

  .lobby-room-players > div:nth-child(5) {
    margin-top: 6px !important;
  }

  .lobby-room-chat {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .lobby-room-chat h2 {
    margin-bottom: clamp(6px, 1.5vh, 10px) !important;
    font-size: clamp(11px, 1.8vw, 16px) !important;
    line-height: 1.2 !important;
  }

  .lobby-room-chat > div:nth-child(2) {
    min-height: 0 !important;
    margin-bottom: 8px !important;
    padding: 8px !important;
    flex: 1 1 auto;
  }

  .lobby-room-chat > div:nth-child(2) > div {
    font-size: clamp(7px, 1vw, 9px) !important;
    line-height: 1.35;
  }

  .lobby-room-chat > div:last-child {
    gap: 6px !important;
  }

  .lobby-room-chat input {
    min-width: 0;
    min-height: 32px;
    padding: 6px 8px !important;
    font-size: clamp(9px, 1.2vw, 11px) !important;
  }

  .lobby-room-chat > div:last-child button {
    min-height: 32px;
    padding: 5px 10px !important;
    font-size: clamp(7px, 0.95vw, 9px) !important;
  }
}
</style>
