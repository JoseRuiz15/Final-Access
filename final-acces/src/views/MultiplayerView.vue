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
            <div class="ml-5 mt-5 ">
                <h1 class="text-[#ECDCFF] font-pixel text-[20px]">BUSCADOR DE PARTIDAS</h1>
                <div class="h-[1px] w-[750px] bg-[#4A4A6A]"></div>
            </div>
            <div class="ml-5 mt-5 flex">
                <h1 class="text-[#B9CACB] font-pixel text-[10px]">NOMBRE DEL SERVIDOR</h1>
                <h1 class="text-[#B9CACB] font-pixel text-[10px] ml-[250px]">MODO</h1>
                <h1 class="text-[#B9CACB] font-pixel text-[10px] ml-[90px]">JUGADPRES</h1>
            </div>
            <div class="ml-5 h-[1px] w-[750px] bg-[#4A4A6A]"></div>
            <!--contenedor que mantiene los servers-->
            <div class="h-[565px] w-[744.67px] mt-5 ml-[5px]">
                <!--servidores competitivo-->
                <div class="bg-[#211536]/50 w-[736.67px] h-[72px] ml-5 mt-5 flex">
                    <h1 class="text-[#DBFCFF] mt-5 ml-[10px]">NEON_STRIKE_US_EAST</h1>
                    <div class="bg-[#D1BCFF]/10 rounded-lg h-[25px] ml-[200px] mt-5">
                        <h1 class="text-[#D1BCFF]">MODO COMPETITIVO</h1>
                    </div>
                    <h1 class="text-[#ECDCFF] mt-5 ml-[65px]">3/5</h1>
                    <button class="text-[#7DF4FF] text-[13px] border border-[#7DF4FF] h-5 mt-5 ml-10 tex-center w-[60px]hover:scale-105 hover:shadow-[0_0_40px_#7DF4FF]">UNIRSE</button>
                </div>
                <!--colavorativo-->
                <div class="bg-[#211536]/50 w-[736.67px] h-[72px] ml-5 mt-[5px] flex">
                    <h1 class="text-[#DBFCFF] mt-5 ml-[10px]">CYBER_BRAWL_EU_01</h1>
                    <div class="bg-[#FF506E]/20 rounded-lg h-[50px] text-center  ml-[200px] mt-5 w-[163.67px]">
                        <h1 class="text-[#FFB2B8]">MODO COLABORATIV0</h1>
                    </div>
                    <h1 class="text-[#ECDCFF] mt-5 ml-[65px]">2/5</h1>
                    <button class="text-[#7DF4FF] text-[13px] border border-[#7DF4FF] h-5 mt-5 ml-[45px] tex-center w-[60px]hover:scale-105 hover:shadow-[0_0_40px_#7DF4FF]">UNIRSE</button>
                </div>
                <!--servidores competitivo-->
                <div class="bg-[#211536]/50 w-[736.67px] h-[72px] ml-5 mt-[5px] flex">
                    <h1 class="text-[#DBFCFF] mt-5 ml-[10px]">UNDERGROUND_FIGHT_CLUB</h1>
                    <div class="bg-[#D1BCFF]/10 rounded-lg h-[25px] ml-[153px] mt-5">
                        <h1 class="text-[#D1BCFF]">MODO COMPETITIVO</h1>
                    </div>
                    <h1 class="text-[#FF506E] mt-5 ml-[65px]">5/5</h1>
                    <button class="text-[#3B494B] text-[13px] border border-[#3B494B] h-5 mt-5 ml-[35px] tex-center w-[60px]">LLENO</button>
                </div>
                <!--colavorativo-->
                <div class="bg-[#211536]/50 w-[736.67px] h-[72px] ml-5 mt-[5px] flex">
                    <h1 class="text-[#DBFCFF] mt-5 ml-[10px]">CORPORATE_HEIST_V2</h1>
                    <div class="bg-[#7DF4FF]/10  rounded-lg h-[50px] text-center  ml-[200px] mt-5 w-[163.67px]">
                        <h1 class="text-[#7DF4FF]">MODO COLABORATIV0</h1>
                    </div>
                    <h1 class="text-[#ECDCFF] mt-5 ml-[65px]">4/5</h1>
                    <button class="text-[#7DF4FF] text-[13px] border border-[#7DF4FF] h-5 mt-5 ml-[35px] tex-center w-[60px]hover:scale-105 hover:shadow-[0_0_40px_#7DF4FF]">UNIRSE</button>
                </div>
                <!--servidores competitivo-->
                <div class="bg-[#211536]/50 w-[736.67px] h-[72px] ml-5 mt-[5px] flex">
                    <h1 class="text-[#DBFCFF] mt-5 ml-[10px]">UNDERGROUND_FIGHT_CLUB</h1>
                    <div class="bg-[#D1BCFF]/10 rounded-lg h-[25px] ml-[153px] mt-5">
                        <h1 class="text-[#D1BCFF]">MODO COMPETITIVO</h1>
                    </div>
                    <h1 class="text-[#ECDCFF] mt-5 ml-[65px]">1/5</h1>
                    <button class="text-[#7DF4FF] text-[13px] border border-[#7DF4FF] h-5 mt-5 ml-[40px] tex-center w-[60px]hover:scale-105 hover:shadow-[0_0_40px_#7DF4FF]">UNIRSE</button>
                </div>
                <!--colavorativo-->
                <div class="bg-[#211536]/50 w-[736.67px] h-[72px] ml-5 mt-[5px] flex">
                    <h1 class="text-[#DBFCFF] mt-5 ml-[10px]">NEON_DISTRICT_7</h1>
                    <div class="bg-[#7DF4FF]/10  rounded-lg h-[50px] text-center  ml-[235px] mt-5 w-[163.67px]">
                        <h1 class="text-[#7DF4FF]">MODO COLABORATIV0</h1>
                    </div>
                    <h1 class="text-[#ECDCFF] mt-5 ml-[5ñ5px]">4/5</h1>
                    <button class="text-[#7DF4FF] text-[13px] border border-[#7DF4FF] h-5 mt-5 ml-10 tex-center w-[60px]hover:scale-105 hover:shadow-[0_0_40px_#7DF4FF]">UNIRSE</button>
                </div>
                
                
                
            </div>
            

        </div>
    </div>
    
    
</template>