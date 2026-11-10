<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: typeof route.query.email === 'string' ? route.query.email : '',
  code: '',
  password: '',
  confirmPassword: '',
})

const step = ref('email')
const isLoading = ref(false)
const error = ref('')
const notice = ref('')
const developmentCode = ref('')

function showRequestError(err, fallback) {
  error.value =
    err.response?.data?.message ||
    (err.code === 'ERR_NETWORK'
      ? 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.'
      : fallback)
}

async function requestCode() {
  const email = form.email.trim()
  if (!email) {
    error.value = 'Escribe el correo asociado a tu cuenta.'
    return
  }

  isLoading.value = true
  error.value = ''
  notice.value = ''
  try {
    const response = await authStore.requestPasswordReset(email)
    notice.value = response.message
    developmentCode.value = response.devCode || ''
    step.value = 'code'
  } catch (err) {
    showRequestError(err, 'No se pudo solicitar el código de recuperación.')
  } finally {
    isLoading.value = false
  }
}

async function resetPassword() {
  if (!/^\d{6}$/.test(form.code)) {
    error.value = 'Escribe el código de seis dígitos que recibiste.'
    return
  }
  if (form.password.length < 8) {
    error.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }
  if (form.password !== form.confirmPassword) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  isLoading.value = true
  error.value = ''
  notice.value = ''
  try {
    const response = await authStore.resetPassword({
      email: form.email.trim(),
      code: form.code,
      password: form.password,
    })
    notice.value = response.message
    step.value = 'complete'
  } catch (err) {
    showRequestError(err, 'No se pudo actualizar la contraseña.')
  } finally {
    isLoading.value = false
  }
}

function editEmail() {
  step.value = 'email'
  form.code = ''
  form.password = ''
  form.confirmPassword = ''
  developmentCode.value = ''
  error.value = ''
  notice.value = ''
}

function backToLogin() {
  router.push({
    name: 'login',
    query: form.email.trim() ? { email: form.email.trim() } : undefined,
  })
}
</script>

<template>
  <section
    id="login-screen"
    class="recovery-screen relative min-h-screen overflow-hidden bg-[#080e20]"
  >
    <img
      src="/img/lobby/sesion.webp"
      alt="Fondo de inicio de sesión"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover"
    />

    <div class="relative z-10 flex min-h-screen items-center justify-center">
      <div
        class="auth-panel login-panel password-recovery-panel relative rounded-3xl bg-black/50 backdrop-blur-sm"
      >
        <h2 class="login-title text-center font-pixel text-[#E41F1F]">
          {{ step === 'complete' ? 'ACCESO RECUPERADO' : 'RECUPERAR CONTRASEÑA' }}
        </h2>

        <p
          v-if="step === 'email'"
          class="recovery-description text-center font-orbitron text-xs text-white/75"
        >
          Escribe el correo de tu cuenta y te enviaremos un código de recuperación.
        </p>
        <p
          v-else-if="step === 'code'"
          class="recovery-description text-center font-orbitron text-xs text-white/75"
        >
          Ingresa el código enviado a <span class="text-cyan-200">{{ form.email }}</span> y crea una
          contraseña nueva.
        </p>
        <p
          v-else
          class="recovery-description text-center font-orbitron text-sm text-emerald-200"
          role="status"
        >
          {{ notice }} Ya puedes iniciar sesión con tu nueva contraseña.
        </p>

        <div
          v-if="error"
          role="alert"
          aria-live="polite"
          class="recovery-error z-10 flex min-h-8 items-center justify-center rounded-lg border border-red-500 bg-red-900/90 px-2 py-1 text-center font-pixel text-xs text-red-200"
        >
          {{ error }}
        </div>

        <form v-if="step === 'email'" class="recovery-form" @submit.prevent="requestCode">
          <div class="recovery-field">
            <div class="login-field-label flex items-center justify-center rounded bg-black/30">
              <label for="recovery-email" class="font-pixel text-white">EMAIL:</label>
            </div>
            <input
              id="recovery-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="login-input rounded-[5px] bg-[#675462]/30 font-orbitron text-white"
              placeholder="tu@email.com"
              :disabled="isLoading"
            />
          </div>

          <p
            v-if="notice"
            class="recovery-status text-center font-orbitron text-[10px] text-cyan-100"
            role="status"
          >
            {{ notice }}
          </p>

          <div class="recovery-action-row flex items-center justify-center">
            <button
              type="submit"
              :disabled="isLoading"
              class="recovery-primary-button rounded-[5px] bg-black/30 font-pixel text-[10px] text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#00AAFF] hover:shadow-[0_0_40px_#00AAFF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isLoading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO' }}
            </button>
          </div>
        </form>

        <form v-else-if="step === 'code'" class="recovery-form" @submit.prevent="resetPassword">
          <p
            v-if="notice"
            class="mt-3 text-center font-orbitron text-[10px] text-cyan-100"
            role="status"
          >
            {{ notice }}
          </p>
          <p
            v-if="developmentCode"
            class="recovery-status text-center font-mono text-xs text-amber-200"
            role="status"
          >
            Código local de prueba: <strong>{{ developmentCode }}</strong>
          </p>

          <div class="recovery-fields">
            <div class="recovery-field">
              <div class="login-field-label flex items-center justify-center rounded bg-black/30">
                <label for="recovery-code" class="font-pixel text-white">CÓDIGO:</label>
              </div>
              <input
                id="recovery-code"
                v-model="form.code"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                pattern="[0-9]{6}"
                required
                class="login-input rounded-[5px] bg-[#675462]/30 font-orbitron tracking-[0.4em] text-white"
                placeholder="000000"
                :disabled="isLoading"
              />
            </div>

            <div class="recovery-field">
              <div class="login-field-label flex items-center justify-center rounded bg-black/30">
                <label for="new-password" class="font-pixel text-white">NUEVA CONTRASEÑA:</label>
              </div>
              <input
                id="new-password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                minlength="8"
                maxlength="128"
                required
                class="login-input rounded-[5px] bg-[#675462]/30 font-orbitron text-white"
                placeholder="Mínimo 8 caracteres"
                :disabled="isLoading"
              />
            </div>

            <div class="recovery-field">
              <div class="login-field-label flex items-center justify-center rounded bg-black/30">
                <label for="confirm-password" class="font-pixel text-white"
                  >CONFIRMAR CONTRASEÑA:</label
                >
              </div>
              <input
                id="confirm-password"
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                minlength="8"
                maxlength="128"
                required
                class="login-input rounded-[5px] bg-[#675462]/30 font-orbitron text-white"
                placeholder="Repite la contraseña"
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="recovery-action-row flex items-center justify-center">
            <button
              type="submit"
              :disabled="isLoading"
              class="recovery-primary-button rounded-[5px] bg-black/30 font-pixel text-[10px] text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#00AAFF] hover:shadow-[0_0_40px_#00AAFF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isLoading ? 'ACTUALIZANDO...' : 'GUARDAR CONTRASEÑA' }}
            </button>
          </div>
        </form>

        <div
          v-if="step === 'code'"
          class="recovery-inline-actions flex flex-wrap justify-center gap-x-4 gap-y-2"
        >
          <button
            type="button"
            class="font-pixel text-[10px] text-[#1FD0E4] transition hover:drop-shadow-[0_0_18px_#00AAFF]"
            :disabled="isLoading"
            @click="requestCode"
          >
            Reenviar código
          </button>
          <button
            type="button"
            class="font-pixel text-[10px] text-white/70 transition hover:text-white"
            :disabled="isLoading"
            @click="editEmail"
          >
            Cambiar correo
          </button>
        </div>

        <div
          v-if="step === 'complete'"
          class="recovery-action-row flex items-center justify-center"
        >
          <button
            type="button"
            class="recovery-primary-button rounded-[5px] bg-black/30 font-pixel text-[10px] text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#00AAFF] hover:shadow-[0_0_40px_#00AAFF]"
            @click="backToLogin"
          >
            VOLVER AL INICIO DE SESIÓN
          </button>
        </div>

        <div v-if="step !== 'complete'" class="recovery-back-row flex justify-center">
          <button
            type="button"
            class="font-pixel text-[10px] text-white/70 transition hover:text-white"
            :disabled="isLoading"
            @click="backToLogin"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.recovery-screen > .relative.z-10 {
  box-sizing: border-box;
  min-height: 100svh;
  padding: 24px;
}

.recovery-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

#login-screen .password-recovery-panel {
  box-sizing: border-box;
  width: min(600px, calc(100vw - 32px)) !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  margin: 0;
  padding: 30px 40px !important;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: visible !important;
}

#login-screen .password-recovery-panel .login-title {
  margin: 0 !important;
  font-size: clamp(22px, 4vw, 30px) !important;
  line-height: 1.28;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.recovery-description {
  margin: 12px 0 0 !important;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.recovery-error {
  position: static !important;
  inset: auto !important;
  width: 100%;
  margin: 12px 0 0;
  box-sizing: border-box;
  flex: 0 0 auto;
}

.recovery-form {
  margin-top: 18px;
}

.recovery-form > p {
  margin: 0 !important;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.recovery-field,
.recovery-fields {
  min-width: 0;
}

.recovery-fields {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.recovery-field {
  display: grid;
  gap: 5px;
}

.recovery-field .login-field-label {
  width: fit-content;
  max-width: 100%;
  min-height: 22px;
  height: auto;
  margin: 0 !important;
  padding: 3px 9px;
  box-sizing: border-box;
}

#login-screen .password-recovery-panel .login-field-label {
  width: fit-content !important;
  height: auto !important;
  min-height: 22px;
  margin: 0 !important;
}

.recovery-field .login-field-label label {
  max-width: 100%;
  font-size: clamp(8px, 0.7rem, 10px);
  line-height: 1.4;
  text-align: center;
  overflow-wrap: anywhere;
}

.recovery-field .login-input {
  width: 100% !important;
  max-width: none;
  height: 36px;
  min-width: 0;
  box-sizing: border-box;
  padding: 0 12px;
  font-size: 14px;
}

.recovery-status {
  color: #c8f5ff;
}

.recovery-action-row {
  width: 100%;
  margin-top: 2px;
}

.recovery-primary-button {
  width: min(100%, 390px);
  min-height: 42px;
  padding: 0 12px;
  line-height: 1.5;
}

.recovery-inline-actions {
  margin-top: 12px;
}

.recovery-back-row {
  margin-top: 12px;
}

.recovery-inline-actions button,
.recovery-back-row button {
  min-height: 32px;
  line-height: 1.5;
  text-align: center;
}

@media (max-width: 768px) {
  #login-screen.recovery-screen {
    overflow-x: hidden !important;
    overflow-y: visible !important;
  }

  #login-screen.recovery-screen > .relative.z-10 {
    min-height: 100svh;
    padding: 14px;
    overflow: visible !important;
  }

  #login-screen .password-recovery-panel {
    width: min(600px, calc(100vw - 28px)) !important;
    margin: 0;
    padding: 22px clamp(18px, 5vw, 30px) !important;
    border-radius: 22px;
  }

  #login-screen .password-recovery-panel .login-title {
    font-size: clamp(20px, 5vw, 27px) !important;
    line-height: 1.22;
  }

  #login-screen .password-recovery-panel .recovery-form {
    margin-top: 14px;
    gap: 9px;
  }

  #login-screen .password-recovery-panel .recovery-fields {
    gap: 7px;
  }

  #login-screen .password-recovery-panel .recovery-field .login-input {
    height: 34px !important;
  }

  #login-screen .password-recovery-panel .recovery-primary-button {
    min-height: 40px;
    font-size: clamp(8px, 2.2vw, 10px) !important;
  }

  #login-screen .password-recovery-panel .recovery-inline-actions,
  #login-screen .password-recovery-panel .recovery-back-row {
    margin-top: 8px;
  }

  #login-screen .password-recovery-panel .recovery-inline-actions button,
  #login-screen .password-recovery-panel .recovery-back-row button {
    font-size: clamp(8px, 2vw, 10px) !important;
  }
}

@media (max-height: 620px) {
  #login-screen .password-recovery-panel {
    padding-top: 16px !important;
    padding-bottom: 16px !important;
  }

  #login-screen .password-recovery-panel .login-title {
    font-size: clamp(18px, 4vh, 26px) !important;
  }

  #login-screen .password-recovery-panel .recovery-description {
    margin-top: 8px !important;
  }

  #login-screen .password-recovery-panel .recovery-form {
    margin-top: 10px;
    gap: 7px;
  }

  #login-screen .password-recovery-panel .recovery-fields {
    gap: 5px;
  }

  #login-screen .password-recovery-panel .recovery-field .login-input {
    height: 32px !important;
  }

  #login-screen .password-recovery-panel .recovery-inline-actions,
  #login-screen .password-recovery-panel .recovery-back-row {
    margin-top: 6px;
  }
}
</style>
