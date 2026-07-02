<!--Funcion para pasar a las paginas-->
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irRegister() {
  router.push('/register')
}

function irLobby() {
  router.push('/lobby')
}
</script>

<template>
    <section id="login-screen" class="relative">
            <!--fondo login-->
            <img src="/img/sesion.png" alt="pantalla de login"
            class="absolute inset-0 w-full h-full object-cover" />
            <!--cuadro-->
            <div class="relative z-10 flex items-center justify-center min-h-screen">

        <div class="w-[510px] h-[560px]
                    bg-black/50
                    rounded-3xl
                    backdrop-blur-sm
                    ">
                <!--texto-->
                <h2 class="font-pixel text-4xl text-[#E41F1F] text-center mt-[50px]">INICIO DE SESION</h2>
                <!--USUARIO-->
                <div class="bg-black/30 w-[150px]  rounded ml-10 mt-10 w-[151px] h-[21px] flex items-center justify-center">
                   <label for="username-input" class="font-pixel text-white text-[10px]">USUARIO:</label>
                </div>
                <div class="mt-[20px] flex items-center justify-center">
                    <input type="text" id="username-input" class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px] flex justify-center items-center">
                </div>
                <!--CONTRASEÑA-->
                <div class="bg-black/30 w-[150px]  rounded ml-10 mt-10 w-[151px] h-[21px] flex items-center justify-center">
                   <label for="next-step-btn" class="font-pixel text-white text-[10px]">CONTRASEÑA:</label>
                </div>
                <div class="mt-[20px] flex items-center justify-center">
                    <input type="password" id="password" class="text-white font-orbitron login-input w-[425px] bg-[#675462]/30 rounded-[5px] h-[30px]">
                </div>
                <!--boton inicio de sesion-->
                <div class="flex justify-center items-center">
                    <button @click="irLobby" id="enter-button" class="text-[10px] font-pixel bg-black/30 text-white rounded h-10 w-[350px] mt-10 rounded-[5px] transition-all duration-300 hover:text-white hover:shadow-[0_0_40px_#00AAFF] hover:bg-[#00AAFF] hover:scale-105">
                        INGRESAR
                    </button>
                </div>
                <!--registro de cuenta-->
                 <div class="flex justify-center items-center mt-[10px]">
                    <p class=" font-pixel text-white text-[15px]">¿No tienes una cuenta?</p>
                 </div>
                 <!--registrarse-->
                 <div class="flex justify-center items-center">
                    <button @click="irRegister" id="record-button" class="font-pixel text-[#1FD0E4] text-[15px]  hover:text-shadow-[0_0_40px_#00e5ff]">registrate aqui</button>
                 </div>

          </div>

        </div>
        </section>
</template>

<!--NOTA: Agregar un botoncito que diga "MANTENER SESION INICIADA" que este abajo del cuadro de texto de la contraseña-->
