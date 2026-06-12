<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irCodeVerification() {
  router.push('/codeverification')
}
</script>

<template>
  <section id="record-screen" class="relative">
    <!--fondo registro-->
    <img
      src="/img/sesion.png"
      alt="pantalla de login"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <!--cuadro registro-->
    <div class="relative z-10 flex items-center justify-center min-h-screen">
      <div class="w-[510px] h-[700px] bg-black/50 rounded-3xl backdrop-blur-sm">
        <!--texto-->
        <h2 class="font-pixel text-4xl text-[#E41F1F] text-center mt-[50px]">REGISTRO</h2>
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
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px] flex justify-center items-center"
          />
        </div>
        <!--email-->
        <div
          class="bg-black/30 w-[150px] rounded ml-10 mt-10 w-[151px] h-[21px] flex items-center justify-center"
        >
          <label for="username-input" class="font-pixel text-white text-[10px]">EMAIL:</label>
        </div>
        <div class="mt-[20px] flex items-center justify-center">
          <input
            type="email"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px] flex justify-center items-center"
          />
        </div>
        <!--contraseña-->
        <div
          class="bg-black/30 rounded ml-10 mt-10 w-[151px] h-[21px] flex items-center justify-center"
        >
          <label for="next-step-btn" class="font-pixel text-white text-[10px]">CONTRASEÑA:</label>
        </div>
        <div class="mt-[20px] flex items-center justify-center">
          <input
            type="password"
            id="password"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px]"
          />
        </div>
        <!--confirmar contraseña-->
        <div
          class="bg-black/30 w-[200px] h-[30px] rounded ml-10 mt-10 flex items-center justify-center"
        >
          <label for="next-step-btn" class="font-pixel text-white text-[9px]"
            >CONFIRMAR CONTRASEÑA:</label
          >
        </div>
        <div class="mt-[20px] flex items-center justify-center">
          <input
            type="password"
            id="confirmPassword"
            class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px]"
          />
        </div>
        <!--boton de registro-->
        <div class="flex justify-center items-center">
          <button
            @click="irCodeVerification"
            id="regist-button"
            class="text-[10px] font-pixel bg-black/30 text-white rounded h-10 w-[350px] mt-[20px] rounded-[5px] transition-all duration-300 hover:text-white hover:shadow-[0_0_40px_#00AAFF] hover:bg-[#00AAFF] hover:scale-105"
          >
            <!--el oneclick es para obligar a que coinsidan la contraseña-->
            REGISTRARSE
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
