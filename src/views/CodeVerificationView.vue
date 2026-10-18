<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  code: '',
})

const isLoading = ref(false)
const error = ref(null)
const notice = ref(null)
const success = ref(false)
const devCode = ref(sessionStorage.getItem('verificationDevCode') || '')
const codeDigits = ref(Array(6).fill(''))
const countdown = ref(600) // 10 minutes in seconds
const countdownInterval = ref(null)

const pendingRegistration = computed(() => authStore.pendingRegistration)
const username = computed(() => pendingRegistration.value?.username || '')
const email = computed(() => pendingRegistration.value?.email || '')
const password = computed(() => pendingRegistration.value?.password || '')

const maskedEmail = computed(() => {
  if (!email.value) return ''
  const [local, domain] = email.value.split('@')
  const maskedLocal = local.length > 3 ? local.slice(0, 3) + '*******' : '*******'
  return `${maskedLocal}@${domain}`
})

function startCountdown() {
  clearInterval(countdownInterval.value)
  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval.value)
    }
  }, 1000)
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function updateCode(event, index) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 6 - index)
  const nextDigits = [...codeDigits.value]

  if (digits.length) {
    for (let offset = 0; offset < digits.length; offset++) {
      nextDigits[index + offset] = digits[offset]
    }
  } else {
    nextDigits[index] = ''
  }

  codeDigits.value = nextDigits
  form.code = nextDigits.join('')
  event.target.value = nextDigits[index]

  if (digits.length) {
    const inputs = document.querySelectorAll('.code-input')
    inputs[Math.min(index + digits.length, 5)]?.focus()
  }
}

function handleCodeBackspace(event, index) {
  if (codeDigits.value[index]) {
    event.preventDefault()
    const nextDigits = [...codeDigits.value]
    nextDigits[index] = ''
    codeDigits.value = nextDigits
    form.code = nextDigits.join('')
    event.target.value = ''
  } else if (index > 0) {
    document.querySelectorAll('.code-input')[index - 1]?.focus()
  }
}

async function handleVerify() {
  if (!pendingRegistration.value) {
    error.value = 'No hay un registro pendiente. Vuelve a iniciar el registro.'
    return
  }

  if (!/^\d{6}$/.test(form.code)) {
    error.value = 'El código debe tener 6 dígitos'
    return
  }

  isLoading.value = true
  error.value = null
  notice.value = null

  try {
    await authStore.verifyEmail({
      username: username.value,
      email: email.value,
      password: password.value,
      code: form.code,
    })
    success.value = true
    devCode.value = ''
    sessionStorage.removeItem('verificationDevCode')
    clearInterval(countdownInterval.value)

    // Redirect to lobby after short delay
    setTimeout(() => {
      router.push('/lobby')
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Código inválido o expirado'
  } finally {
    isLoading.value = false
  }
}

async function resendCode() {
  if (!pendingRegistration.value) {
    error.value = 'No hay un registro pendiente. Vuelve a iniciar el registro.'
    return
  }

  isLoading.value = true
  error.value = null
  notice.value = null

  try {
    const registration = await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    devCode.value = registration.devCode || ''
    if (devCode.value) {
      sessionStorage.setItem('verificationDevCode', devCode.value)
    } else {
      sessionStorage.removeItem('verificationDevCode')
    }
    countdown.value = 600
    startCountdown()
    notice.value = 'Código reenviado correctamente'
    setTimeout(() => { notice.value = null }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error al reenviar código'
  } finally {
    isLoading.value = false
  }
}

function goBackToRegister() {
  router.push('/register')
}

onMounted(() => {
  if (!pendingRegistration.value) {
    router.replace('/register')
    return
  }

  startCountdown()
  // Auto-focus first input
  setTimeout(() => {
    document.querySelector('input[type="text"]')?.focus()
  }, 100)
})

onUnmounted(() => {
  clearInterval(countdownInterval.value)
})
</script>

<template>
  <section id="code-screen" class="relative min-h-screen overflow-hidden">
    <!--fondo codigo-->
    <img
      src="/img/lobby/sesion.png"
      alt="pantalla de login"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <!--cuadro de verificacion de codigo-->
    <div class="relative z-10 flex items-center justify-center min-h-screen">
      <div class="auth-panel w-[550px] h-[550px] rounded-3xl bg-[#14172C] border-4 border-[#68699E]">
        <!--textos-->
        <p class="text-[#A55CCF] font-pixel text-3xl text-center mt-10">VERIFICACION DE CORREO</p>

        <p v-if="!devCode" class="text-[15px] text-white font-pixel text-center">
          Hemos enviado un código de verificación a tu correo electrónico
        </p>

        <div v-if="devCode" class="mx-6 mt-4 rounded-lg border border-yellow-500 bg-yellow-900/40 p-3 text-center text-yellow-200">
          <p class="font-pixel text-xs">Código local de desarrollo (no se envió un correo):</p>
          <p class="mt-2 font-pixel text-2xl tracking-[0.3em]">{{ devCode }}</p>
        </div>

        <!--revision del correo-->
        <div
          class="bg-[#2D304B] flex items-center justify-center mt-5 w-[500px] h-[40px] rounded-lg ml-[20px]"
        >
          <p class="text-white text-[12px]">{{ maskedEmail }}</p>
          <!--boton que regresa la inicio-->
          <button
            @click="goBackToRegister"
            class="text-[#47FB3E] text-[8px] font-pixel ml-[100px] hover:text-[#47FB3E] hover:text-shadow-[0_0_20px_#47FB3E]"
          >
            ¿No es tu correo?
          </button>
        </div>

        <!-- Error/Success message -->
        <div v-if="error" class="mx-10 mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm font-pixel text-center">
          {{ error }}
        </div>

        <div v-if="success" class="mx-10 mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-green-200 text-sm font-pixel text-center">
          ¡Verificación exitosa! Redirigiendo...
        </div>

        <div v-if="notice" class="mx-10 mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-green-200 text-sm font-pixel text-center">
          {{ notice }}
        </div>

        <!--texto-->
        <p class="text-white text-1xl font-pixel text-center mt-[20px]">Introduce el código</p>

        <!--donde colocar el codigo-->
        <div class="flex items-center justify-center gap-4 mt-5">
          <!--cajas donde se colocan los numeros-->
          <input
            v-for="i in 6"
            :key="i"
            type="text"
            maxlength="6"
            :value="codeDigits[i - 1]"
            @input="updateCode($event, i - 1)"
            @keydown.backspace="handleCodeBackspace($event, i - 1)"
            class="code-input rounded-lg border border-[#333553] border-4 bg-[#14182D] text-white font-pixel text-center w-[50px] h-[50px]"
            :disabled="isLoading || success"
            :autocomplete="i === 1 ? 'one-time-code' : 'off'"
            inputmode="numeric"
          />
        </div>

        <!--boton de verificacion-->
        <div class="flex items-center justify-center mt-[20px] gap-[80px]">
          <div
            class="flex items-center justify-center border border-4 border-[#DCF284] w-[180px] rounded-lg bg-[#67AC57] hover:border-[#c8ff00]"
          >
            <button
              class="text-black font-pixel text-center text-[15px] bg-[#67AC57] border border-4 border-[#247439] rounded-lg w-[180px] transition-all duration-300 hover:text-white hover:shadow-[0_0_40px_#00ff00] hover:bg-[#00ff00] hover:scale-105 hover:border-[#0fc70f]"
              @click="handleVerify"
              :disabled="isLoading || success"
            >
              {{ isLoading ? 'VERIFICANDO...' : 'VERIFICAR' }}
            </button>
          </div>

          <div
            class="flex items-center justify-center border border-4 border-[#615694] w-[180px] rounded-lg bg-[#3F2F6B]"
          >
            <button
              class="text-[#A282DC] font-pixel text-center text-[10px] bg-[#3F2F6B] border border-4 border-[#1F1C46] rounded-lg w-[300px] transition-all duration-300 hover:bg-[#4F3F7B] hover:scale-105"
              @click="resendCode"
              :disabled="isLoading"
            >
              REENVIAR CÓDIGO
            </button>
          </div>
        </div>

        <!--cronometro-->
        <div class="mt-5 text-center">
          <p class="text-white font-pixel">Reenviar código en <span class="text-[#A55CCF]">{{ formatTime(countdown) }}</span></p>
        </div>
      </div>
    </div>
  </section>
</template>
