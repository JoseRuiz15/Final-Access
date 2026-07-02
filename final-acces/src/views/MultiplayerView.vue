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
        <div class="bg-[#190C2D]/70 h-[563px] w-[463px] absolute left-[250px] top-[100px] backdrop-blur-sm rounded-lg">
            <!--texto-->
            <h1 class="text-[#00f7ff] font-pixel ml-5 mt-5 ">UNIRSE A LOBBY PRIVADO</h1>
            <h1 class="text-[#D1BCFF] ml-5 font-pixel text-[16px] mt-20
            ">CODIGO DE LOBBY</h1>

                <div class="mt-[20px] flex items-center justify-center text-[#fff]">
                    <input type="text" id="code-input" class=" font-orbitron login-input w-[425px] bg-[#06093d]/70 rounded-[5px] h-[45px] flex justify-center items-center text-center">
                </div>
                <!--boton para unirse-->
                <button class="bg-[#53f4ff] h-[60px] w-[424px] mt-10 ml-5 font-pixel rounded-lg hover:scale-105 hover:shadow-[0_0_40px_#53f4ff] hover:text-white">
                    CONECTAR
                </button>
                <!--boton para crear partida-->
                <button class=" h-[60px] w-[424px] mt-10 ml-5 font-pixel rounded-lg border text-[#53f4ff] border-4 border-[#53f4ff] hover:scale-105 hover:shadow-[0_0_40px_#53f4ff] hover:text-white">
                    CREAR PARTIDA
                </button>
        </div>
        <div class="h-[720px] w-[793px] bg-[#190C2D]/70 absolute top-[80px] right-[200px] backdrop-blur-sm rounded-lg border border-[#3B494B]">
            <div class="h-10 w-[500px] ml-5 mt-5 ">
                <h1 class="text-[#ECDCFF] font-pixel text-[20px]">BUSCADOR DE PARTIDAS</h1>
            </div>

        </div>
    </div>
    
    
</template>