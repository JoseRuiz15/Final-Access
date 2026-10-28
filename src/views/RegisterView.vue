<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const error = ref(null)

function irLogin() {
  router.push('/login')
}

async function handleRegister() {
  if (!form.username || !form.email || !form.password || !form.confirmPassword) {
    error.value = 'Por favor completa todos los campos'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  if (form.password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const registration = await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
    })
    if (registration.devCode) {
      sessionStorage.setItem('verificationDevCode', registration.devCode)
    } else {
      sessionStorage.removeItem('verificationDevCode')
    }
    // The auth store keeps pending credentials in memory, never in the URL or browser storage.
    router.push({
      name: 'codeverification',
    })
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error en el registro'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section id="record-screen" class="relative min-h-screen overflow-hidden bg-[#080e20]">
    <!--fondo registro-->
    <img
      src="/img/lobby/sesion.webp"
      alt="pantalla de login"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <!--cuadro registro-->
    <div class="relative z-10 flex items-center justify-center min-h-screen">
      <div class="auth-panel relative w-[510px] h-[700px] bg-black/50 rounded-3xl backdrop-blur-sm">
        <!--texto-->
        <h2 class="font-pixel text-4xl text-[#E41F1F] text-center mt-[50px]">REGISTRO</h2>

        <!-- Error message -->
        <div
          v-if="error"
          role="alert"
          aria-live="polite"
          class="absolute top-[98px] left-10 right-10 h-8 px-2 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-xs font-pixel text-center flex items-center justify-center overflow-hidden"
        >
          {{ error }}
        </div>

        <!--USUARIO-->
        <div
          class="bg-black/30 w-[150px] rounded ml-10 mt-10 w-[151px] h-[21px] flex items-center justify-center"
        >
          <label for="username-input" class="font-pixel text-white text-[10px]">USUARIO:</label>
        </div>
        <div class="mt-[20px] flex items-center justify-center">
          <input
            type="text"
            id="username-input"
            v-model="form.username"
            @keyup.enter="handleRegister"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px] flex justify-center items-center"
            placeholder="tu_usuario"
            :disabled="isLoading"
          />
        </div>

        <!--email-->
        <div
          class="bg-black/30 w-[150px] rounded ml-10 mt-10 w-[151px] h-[21px] flex items-center justify-center"
        >
          <label for="email-input" class="font-pixel text-white text-[10px]">EMAIL:</label>
        </div>
        <div class="mt-[20px] flex items-center justify-center">
          <input
            type="email"
            id="email-input"
            v-model="form.email"
            @keyup.enter="handleRegister"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px] flex justify-center items-center"
            placeholder="tu@email.com"
            :disabled="isLoading"
          />
        </div>

        <!--contraseña-->
        <div
          class="bg-black/30 rounded ml-10 mt-10 w-[151px] h-[21px] flex items-center justify-center"
        >
          <label for="password" class="font-pixel text-white text-[10px]">CONTRASEÑA:</label>
        </div>
        <div class="mt-[20px] flex items-center justify-center">
          <input
            type="password"
            id="password"
            v-model="form.password"
            @keyup.enter="handleRegister"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px]"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <!--confirmar contraseña-->
        <div
          class="bg-black/30 w-[200px] h-[30px] rounded ml-10 mt-10 flex items-center justify-center"
        >
          <label for="confirmPassword" class="font-pixel text-white text-[9px]"
            >CONFIRMAR CONTRASEÑA:</label
          >
        </div>
        <div class="mt-[20px] flex items-center justify-center">
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            @keyup.enter="handleRegister"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px]"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <!--boton de registro-->
        <div class="flex justify-center items-center">
          <button
            @click="handleRegister"
            :disabled="isLoading"
            id="regist-button"
            class="text-[10px] font-pixel bg-black/30 text-white rounded h-10 w-[350px] mt-[20px] rounded-[5px] transition-all duration-300 hover:text-white hover:shadow-[0_0_40px_#00AAFF] hover:bg-[#00AAFF] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'REGISTRANDO...' : 'REGISTRARSE' }}
          </button>
        </div>

        <!-- Volver a login -->
        <div class="flex justify-center items-center mt-[10px]">
          <p class="font-pixel text-white text-[15px]">¿Ya tienes una cuenta?</p>
        </div>
        <div class="flex justify-center items-center">
          <button
            @click="irLogin"
            class="font-pixel text-[#1FD0E4] text-[15px] transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_40px_#00AAFF]"
          >
            inicia sesión aqui
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
