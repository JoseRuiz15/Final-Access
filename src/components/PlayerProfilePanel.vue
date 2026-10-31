<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCharacterStore } from '@/stores/characters'
import { getCachedAvatarImage, useProfileStore } from '@/stores/profile'
import { useProgressionStore } from '@/stores/progression'

const props = defineProps({ compact: { type: Boolean, default: false } })
const authStore = useAuthStore()
const characterStore = useCharacterStore()
const profileStore = useProfileStore()
const progressionStore = useProgressionStore()

const isOpen = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const nameDraft = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const avatarInput = ref(null)
const avatarPreview = ref('')

const playerName = computed(
  () => profileStore.profile?.displayName || authStore.user?.username || 'Jugador',
)

function avatarFor(characterId) {
  if (!characterId) return '/img/profile/perfil.webp'
  return characterStore.getCharacterById(characterId)?.perfil || '/img/profile/perfil.webp'
}

const cachedAvatar = computed(() =>
  getCachedAvatarImage(profileStore.profile?.userId || authStore.user?.id),
)
const avatarUrl = computed(
  () =>
    avatarPreview.value ||
    profileStore.profile?.avatarImageData ||
    cachedAvatar.value ||
    avatarFor(profileStore.profile?.avatarCharacterId),
)
const avatarChoices = computed(() =>
  characterStore.unlockedCharacters
    .map((id) => characterStore.getCharacterById(id))
    // Cosa 1 repite exactamente la imagen predeterminada.
    .filter((character) => character && character.id !== 'cosa1'),
)

const completedLevels = computed(() =>
  progressionStore.levelProgress.filter((item) => item.completed),
)
const highestCompletedLevel = computed(() =>
  completedLevels.value.reduce((highest, item) => Math.max(highest, item.levelId), 0),
)
const bestLevelTime = computed(() =>
  completedLevels.value
    .filter((item) => Number.isFinite(item.bestTimeSec) && item.bestTimeSec > 0)
    .reduce(
      (best, item) => (!best || item.bestTimeSec < best.bestTimeSec ? item : best),
      null,
    ),
)
const charactersOwned = computed(() => characterStore.unlockedCharacters.length)
const enemiesDefeated = computed(() => progressionStore.gameProgress?.enemiesKilled || 0)
const totalPlaytime = computed(() => formatPlaytime(profileStore.profile?.totalPlaytimeSec || 0))
const accountCreated = computed(() => {
  const date = profileStore.profile?.createdAt
  if (!date) return 'Sin registro'
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? 'Sin registro'
    : parsedDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
})

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const minutes = Math.floor(total / 60)
  const remainder = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function formatPlaytime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remainder = total % 60
  if (hours) return `${hours} h ${minutes} min`
  if (minutes) return `${minutes} min ${remainder} s`
  return `${remainder} s`
}

async function openProfile() {
  isOpen.value = true
  errorMessage.value = ''
  successMessage.value = ''
  nameDraft.value = playerName.value
  avatarPreview.value = ''
  isLoading.value = true

  try {
    await Promise.all([
      profileStore.fetchProfile(),
      progressionStore.fetchProgress(),
      characterStore.fetchCatalog(),
    ])
    await characterStore.fetchUnlocked(profileStore.profile)
    await characterStore.autoUnlockFreeCharacters()
    nameDraft.value = playerName.value
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || error.response?.data?.error || 'No se pudo cargar el perfil.'
  } finally {
    isLoading.value = false
  }
}

function closeProfile() {
  if (isSaving.value) return
  isOpen.value = false
  errorMessage.value = ''
}

async function saveName() {
  const displayName = nameDraft.value.trim()
  if (!displayName || displayName.length > 32) {
    errorMessage.value = 'El nombre debe tener entre 1 y 32 caracteres.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await profileStore.updateProfile({ displayName })
    nameDraft.value = displayName
    successMessage.value = 'Nombre guardado.'
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || error.response?.data?.error || 'No se pudo guardar el nombre.'
  } finally {
    isSaving.value = false
  }
}

async function saveAvatar(characterId) {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await profileStore.updateProfile({ avatarCharacterId: characterId, avatarImageData: null })
    avatarPreview.value = ''
    successMessage.value = 'Foto de perfil guardada.'
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || error.response?.data?.error || 'No se pudo guardar la foto.'
  } finally {
    isSaving.value = false
  }
}

function openAvatarPicker() {
  avatarInput.value?.click()
}

function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight))
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      const webp = canvas.toDataURL('image/webp', 0.82)
      resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.82))
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No se pudo abrir la imagen seleccionada.'))
    }
    image.src = objectUrl
  })
}

async function handleAvatarFile(event) {
  const input = event.target
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    errorMessage.value = 'Selecciona una imagen JPG, PNG, WEBP o GIF.'
    return
  }
  if (file.size > 15 * 1024 * 1024) {
    errorMessage.value = 'La imagen debe ocupar menos de 15 MB.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const avatarImageData = await resizeAvatar(file)
    if (avatarImageData.length > 400_000) {
      throw new Error('La imagen no se pudo reducir lo suficiente. Prueba con otra foto.')
    }
    avatarPreview.value = avatarImageData
    await profileStore.updateProfile({ avatarCharacterId: null, avatarImageData })
    successMessage.value = 'Foto de perfil guardada en tu cuenta.'
  } catch (error) {
    avatarPreview.value = ''
    errorMessage.value =
      error.response?.data?.message || error.response?.data?.error || error.message || 'No se pudo guardar la foto.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <button
      type="button"
      class="header-profile group flex items-center border-4 border-[#2D2F4B] rounded-lg bg-[#050711] text-left transition hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF55] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
      :aria-label="`Abrir perfil de ${playerName}`"
      @click="openProfile"
    >
      <div
        class="ml-4 overflow-hidden rounded-lg border-3 border-[#444665]"
        :class="compact ? 'h-[80px] w-[80px]' : 'h-[100px] w-[100px]'"
      >
        <img :src="avatarUrl" :alt="`Foto de ${playerName}`" class="h-full w-full object-cover" />
      </div>
      <div class="ml-6 flex min-w-0 flex-col">
        <span
          class="truncate font-pixel text-white"
          :class="compact ? 'text-[18px]' : 'text-[22px]'"
        >
          {{ playerName }}
        </span>
        <span class="mt-2 font-pixel text-[12px] text-[#FB00FF]">
          Nivel {{ profileStore.profile?.level || authStore.user?.level || 1 }}
        </span>
      </div>
  </button>

  <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-[#02040c]/85 p-3 backdrop-blur-sm sm:p-6"
        @click.self="closeProfile"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="player-profile-title"
          class="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto border border-cyan-300/50 bg-[#07101f]/95 p-5 text-white shadow-[0_0_60px_#00d9ff22] sm:p-8"
        >
          <div class="pointer-events-none absolute inset-2 border border-cyan-100/10"></div>
          <div class="relative">
            <header class="mb-6 flex items-start justify-between gap-4 border-b border-cyan-100/15 pb-4">
              <div>
                <p class="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-100/50">
                  Final Access / Archivo del jugador
                </p>
                <h2 id="player-profile-title" class="mt-2 font-pixel text-lg text-cyan-100 sm:text-2xl">
                  PERFIL DE {{ playerName }}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar perfil"
                class="grid h-10 w-10 shrink-0 place-items-center border border-white/20 font-pixel text-lg text-white/70 hover:border-cyan-200 hover:text-cyan-100"
                @click="closeProfile"
              >
                ×
              </button>
            </header>

            <div v-if="isLoading" class="py-16 text-center font-pixel text-xs text-cyan-100">
              CARGANDO ARCHIVO...
            </div>

            <template v-else>
              <section class="mb-7 flex flex-col items-center border-b border-cyan-100/15 pb-6 text-center">
                <button
                  type="button"
                  class="group relative mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-cyan-200/80 bg-[#030915] shadow-[0_0_24px_#00d9ff33] transition hover:border-fuchsia-300 hover:shadow-[0_0_28px_#fb00ff55] disabled:opacity-60"
                  :disabled="isSaving"
                  :aria-label="isSaving ? 'Guardando foto de perfil' : 'Elegir foto desde el dispositivo'"
                  @click="openAvatarPicker"
                >
                  <img :src="avatarUrl" :alt="`Foto de ${playerName}`" class="h-full w-full object-cover" />
                  <span class="absolute inset-x-0 bottom-0 bg-black/75 py-2 font-mono text-[8px] uppercase tracking-wider text-cyan-50 opacity-0 transition group-hover:opacity-100">
                    Cambiar foto
                  </span>
                </button>
                <input
                  ref="avatarInput"
                  class="hidden"
                  type="file"
                  accept="image/*"
                  aria-label="Seleccionar foto de perfil"
                  @change="handleAvatarFile"
                />
                <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-100/55">
                  Foto de perfil · pulsa para elegir una imagen del dispositivo
                </p>

                <form class="mt-5 w-full max-w-md" @submit.prevent="saveName">
                  <label for="profile-display-name" class="font-mono text-[10px] uppercase tracking-wider text-cyan-100/70">
                    Cambiar nombre visible
                  </label>
                  <div class="mt-3 flex gap-2">
                    <input
                      id="profile-display-name"
                      v-model="nameDraft"
                      type="text"
                      maxlength="32"
                      autocomplete="nickname"
                      class="min-w-0 flex-1 border border-cyan-100/20 bg-[#030915] px-3 py-3 font-mono text-sm text-white outline-none focus:border-cyan-200"
                    />
                    <button
                      type="submit"
                      :disabled="isSaving"
                      class="border border-cyan-100 bg-cyan-100 px-4 font-pixel text-[8px] text-[#07101f] disabled:opacity-50"
                    >
                      {{ isSaving ? '...' : 'GUARDAR' }}
                    </button>
                  </div>
                </form>

                <div class="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    aria-label="Usar foto predeterminada"
                    class="h-12 w-12 overflow-hidden rounded-full border-2 transition"
                    :class="!profileStore.profile?.avatarCharacterId && !profileStore.profile?.avatarImageData ? 'border-cyan-200 shadow-[0_0_12px_#00d9ff77]' : 'border-white/20 hover:border-cyan-100'"
                    :disabled="isSaving"
                    @click="saveAvatar(null)"
                  >
                    <img src="/img/profile/perfil.webp" alt="Predeterminada" class="h-full w-full object-cover" />
                  </button>
                  <button
                    v-for="character in avatarChoices"
                    :key="character.id"
                    type="button"
                    :aria-label="`Usar retrato de ${character.nombre}`"
                    class="h-12 w-12 overflow-hidden rounded-full border-2 transition"
                    :class="profileStore.profile?.avatarCharacterId === character.id && !profileStore.profile?.avatarImageData ? 'border-cyan-200 shadow-[0_0_12px_#00d9ff77]' : 'border-white/20 hover:border-cyan-100'"
                    :disabled="isSaving"
                    @click="saveAvatar(character.id)"
                  >
                    <img :src="character.perfil" :alt="character.nombre" class="h-full w-full object-cover" />
                  </button>
                </div>
              </section>

              <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
                <article class="border-l-2 border-cyan-300 bg-cyan-950/25 p-4">
                  <p class="font-mono text-[9px] uppercase tracking-wider text-cyan-100/55">Nivel más alto superado</p>
                  <p class="mt-2 font-pixel text-xl text-cyan-100">
                    {{ highestCompletedLevel ? `NIVEL ${highestCompletedLevel}` : 'AÚN NO' }}
                  </p>
                </article>
                <article class="border-l-2 border-fuchsia-300 bg-fuchsia-950/20 p-4">
                  <p class="font-mono text-[9px] uppercase tracking-wider text-fuchsia-100/55">Mejor tiempo</p>
                  <p class="mt-2 font-pixel text-xl text-fuchsia-100">
                    {{ bestLevelTime ? formatTime(bestLevelTime.bestTimeSec) : '--:--' }}
                  </p>
                  <p class="mt-1 font-mono text-[9px] text-white/50">
                    {{ bestLevelTime ? `Nivel ${bestLevelTime.levelId}` : 'Sin niveles completados' }}
                  </p>
                </article>
                <article class="border-l-2 border-sky-200 bg-sky-950/25 p-4">
                  <p class="font-mono text-[9px] uppercase tracking-wider text-sky-100/55">Enemigos derrotados</p>
                  <p class="mt-2 font-pixel text-xl text-sky-100">{{ enemiesDefeated }}</p>
                  <p class="mt-1 font-mono text-[9px] text-white/50">Acumulado de la cuenta</p>
                </article>
                <article class="border-l-2 border-amber-200 bg-amber-950/20 p-4">
                  <p class="font-mono text-[9px] uppercase tracking-wider text-amber-100/55">Personajes que posee</p>
                  <p class="mt-2 font-pixel text-xl text-amber-100">{{ charactersOwned }}</p>
                </article>
                <article class="border-l-2 border-emerald-200 bg-emerald-950/20 p-4">
                  <p class="font-mono text-[9px] uppercase tracking-wider text-emerald-100/55">Tiempo jugado registrado</p>
                  <p class="mt-2 font-pixel text-base text-emerald-100 sm:text-xl">{{ totalPlaytime }}</p>
                </article>
                <article class="border-l-2 border-white/35 bg-white/5 p-4">
                  <p class="font-mono text-[9px] uppercase tracking-wider text-white/45">Cuenta creada</p>
                  <p class="mt-2 font-mono text-sm text-white">{{ accountCreated }}</p>
                </article>
              </div>

              <p v-if="!avatarChoices.length" class="mt-3 text-center font-mono text-[9px] text-white/40">
                No hay más retratos desbloqueados todavía.
              </p>

              <p v-if="errorMessage" role="alert" class="mt-4 border border-rose-300/30 bg-rose-950/40 px-4 py-3 font-mono text-xs text-rose-100">
                {{ errorMessage }}
              </p>
              <p v-else-if="successMessage" role="status" class="mt-4 border border-emerald-300/25 bg-emerald-950/30 px-4 py-3 font-mono text-xs text-emerald-100">
                {{ successMessage }}
              </p>
              <p class="mt-4 font-mono text-[9px] text-white/35">
                El tiempo registrado suma las partidas que se han guardado al completar un nivel.
              </p>
            </template>
          </div>
        </section>
      </div>
  </Teleport>
</template>
