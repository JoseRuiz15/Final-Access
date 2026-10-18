<!--Funcion para pasar a las paginas-->
<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)
const error = ref(null)

function irRegister() {
  router.push('/register')
}

async function handleLogin() {
  if (!form.email || !form.password) {
    error.value = 'Por favor completa todos los campos'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await authStore.login({ email: form.email, password: form.password })
    // Redirect to intended page or lobby
    const redirect = route.query.redirect || '/lobby'
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section id="login-screen" class="relative min-h-screen overflow-hidden">
    <!--fondo login-->
    <img
      src="/img/lobby/sesion.png"
      alt="pantalla de login"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <!--cuadro-->
    <div class="relative z-10 flex items-center justify-center min-h-screen">
      <div class="auth-panel w-[510px] h-[560px] bg-black/50 rounded-3xl backdrop-blur-sm">
        <!--texto-->
        <h2 class="font-pixel text-4xl text-[#E41F1F] text-center mt-[50px]">INICIO DE SESION</h2>

        <!-- Error message -->
        <div v-if="error" class="mx-10 mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm font-pixel text-center">
          {{ error }}
        </div>

        <!--USUARIO-->
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
            @keyup.enter="handleLogin"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px] flex justify-center items-center"
            placeholder="tu@email.com"
            :disabled="isLoading"
          />
        </div>

        <!--CONTRASEÑA-->
        <div
          class="bg-black/30 w-[150px] rounded ml-10 mt-10 w-[151px] h-[21px] flex items-center justify-center"
        >
          <label for="password" class="font-pixel text-white text-[10px]">CONTRASEÑA:</label>
        </div>
        <div class="mt-[20px] flex items-center justify-center">
          <input
            type="password"
            id="password"
            v-model="form.password"
            @keyup.enter="handleLogin"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px]"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </div>

        <!--boton inicio de sesion-->
        <div class="flex justify-center items-center">
          <button
            @click="handleLogin"
            :disabled="isLoading"
            id="enter-button"
            class="text-[10px] font-pixel bg-black/30 text-white rounded h-10 w-[350px] mt-10 rounded-[5px] transition-all duration-300 hover:text-white hover:shadow-[0_0_40px_#00AAFF] hover:bg-[#00AAFF] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'INICIANDO...' : 'INGRESAR' }}
          </button>
        </div>

        <!--registro de cuenta-->
        <div class="flex justify-center items-center mt-[10px]">
          <p class="font-pixel text-white text-[15px]">¿No tienes una cuenta?</p>
        </div>
        <!--registrarse-->
        <div class="flex justify-center items-center">
          <button
            @click="irRegister"
            id="record-button"
            class="font-pixel text-[#1FD0E4] text-[15px] transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_40px_#00AAFF]"
          >
            registrate aqui
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
