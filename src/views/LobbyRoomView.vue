<script setup>
import { ref, onMounted, computed } from 'vue'
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
  <div class="lobby-room-screen relative min-h-screen bg-[#080e20] text-white font-pixel">
    <img
      src="/img/multy-player/partida.webp"
      class="absolute inset-0 w-full h-full object-cover -z-10 opacity-50"
    />

    <div class="flex h-screen p-10 gap-10">
      <!-- Columna Izquierda: Jugadores -->
      <div class="w-1/3 bg-[#190C2D]/80 backdrop-blur-md rounded-lg p-6 border border-[#53f4ff]/30">
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
        class="w-2/3 bg-[#190C2D]/80 backdrop-blur-md rounded-lg p-6 border border-[#53f4ff]/30 flex flex-col"
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
