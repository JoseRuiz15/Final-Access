<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irLobby() {
  router.push('/lobby')
}
</script>
<template>
    <div class="relative min-h-screen">
        <!--fondo del multijugador-->
        <img src="/img/partida.png" alt="imagen del multi" class="h-full w-full absolute inset-0 objet-cover -z-10">
        
        <button
      class="absolute top-6 left-6 z-20 text-white font-pixel text-[13px] hover:text-[#FF00D9] hover:shadow-[0_0_30px_#FF00D9] transition-all duration-300"
      @click="irLobby"
    >
      &lt;- VOLVER AL MENU
    </button>
        <!--cuadro para crear sala-->
        <div class="bg-[#100f55cc]/70 h-[450px] w-[464px] absolute left-[250px] top-[100px] backdrop-blur-sm rounded-lg">
            <!--texto-->
            <h1 class="text-[#00f7ff] font-pixel text-center mt-5 ">UNIRSE A LOBBY PRIVADO</h1>
            <h1 class="text-white text-center font-pixel text-[13px] mt-10">CODIGO DE LOBBY</h1>

                <div class="mt-[20px] flex items-center justify-center">
                    <input type="text" id="code-input" class="text-white font-orbitron login-input w-[425px] bg-[#06093d]/70 rounded-[5px] h-[45px] flex justify-center items-center text-center border-b">
                </div>
                <!--boton para unirse-->
                <button class="bg-[#53f4ff] h-10 w-[424px] mt-10 ml-5 font-pixel rounded-lg hover:scale-105 hover:shadow-[0_0_40px_#53f4ff] hover:text-white">
                    CONECTAR
                </button>
                <!--boton para crear partida-->
                <button class=" h-10 w-[424px] mt-5 ml-5 font-pixel rounded-lg border text-[#53f4ff] border-4 border-[#53f4ff] hover:scale-105 hover:shadow-[0_0_40px_#53f4ff] hover:text-white">
                    CREAR PARTIDA
                </button>
        </div>
        <div class="h-[700px] w-[900px] bg-[#100f55cc] absolute top-[80px] right-[200px] backdrop-blur-sm rounded-lg">

        </div>
    </div>
    
    
</template>