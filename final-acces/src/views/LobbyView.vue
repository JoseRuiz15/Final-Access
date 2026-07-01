<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irGameMode() {
  router.push('/gamemode')
}

function irCharacters() {
  router.push('/characters')
}
</script>

<template>
<section id="lobby-screen">
    
    
    
    <!--cuadro de lobby-->
    <div class="relative min-h-screen overflow-hidden">
      <!--fondo del lobby-->
      <img src="/img/lobby2.png" alt="imagen del lobby" class="absolute inset-0 w-full h-full object-cover -z-10">
      <!--cuadro de arriba-->
      <div class="w-full h-[150px] bg-[#050711]/50 backdrop-blur-sm border border-4 border-[#2D2F4B] flex items-center justifi-center  ">
        <!--cuadro de ususario-->
        <div class="bg-[#050711] w-[450px] h-[110px] border border-4 border-[#2D2F4B] ml-[10px] rounded-lg flex items-center">
          <!--cuadro de foto de perfil-->
          <div class="w-[100px] h-[100px] border border-3 border-[#444665] rounded-lg">
            <img src="/img/perfil.png" alt="imagende perfil">
          </div>
          <!--texto del nombre proximo a cambio-->
          <h1 class="text-white text-start ml-10 text-[30px]">DIN_03</h1>
        </div>
        <!--inico-->
        <div class="absolute left-[500px] top-[90px]">
          <h1 class="text-[#CF56D2] font-pixel">INICIO</h1>
        </div>
        <!--para pasar donde los personajes-->
        <button class="absolute left-[700px] top-[90px]" >
          <h1 class="text-[#876988] font-pixel hover:text-[#CF56D2] hover:text-shadow-[0_0_40px_#CF56D2]" @click="irCharacters">PERSONAJES</h1>
        </button>
        <!--para pasar a la tienda-->
        <button class=" absolute left-[1000px] top-[90px]">
          <h1 class="text-[#876988] font-pixel hover:text-[#CF56D2] hover:text-shadow-[0_0_40px_#CF56D2]">TIENDA</h1>
        </button>
        <!--puntos-->
        <div class="absolute right-[500px] flex">
          <img src="/img/moneda.png" alt="puntos" class="h-[30px]">
          <h1 class="font-pixel text-[20px] text-[#FB00FF] ">12.000</h1>
        </div>
        <!--ajustes, mensajes y cierre de secion-->
        <div class="w-[50px] h-[50px] border border-3 border-[#41334B] rounded-lg absolute right-[300px]">
          <img src="/img/ajustes.png" alt="ajustes">
        </div>
        <div class="w-[50px] h-[50px] border border-3 border-[#41334B] rounded-lg absolute right-[200px]">
          <img src="/img/mensajes.png" alt="mensajes">
        </div>
        <div class="w-[50px] h-[50px] border border-3 border-[#41334B] rounded-lg absolute right-[100px]">
          <img src="/img/salida.png" alt="cierre de secion">
        </div>
      </div>
      <!--cuadros de calificatoria-->
      <div class="h-20 w-80 border border-4 border-[#00FFEA] mt-20 ml-10 bg-[#000004] rounded-lg flex items-center">
        <div class="h-15 w-15 border border-3 border-white ml-[10px] rounded-lg">
          <img src="" alt="imagen">
        </div>
        <h1 class="text-[#9898BD] font-pixel text-[15px] ml-[10px]">CLASIFICATORIA</h1>
      </div>
      <div class="h-20 w-80 border border-4 border-[#00FFEA] mt-10 ml-10 bg-[#000004] rounded-lg flex">
        <div class="h-15 w-15 border border-3 border-white ml-[10px] rounded-lg mt-[7px]">
          <img src="" alt="imagen">
        </div>
        <div class="mt-[10px]">
          <h1 class="text-[#9898BD] font-pixel text-[15px] ml-[10px] ">AMIGOS</h1>
          <p class="text-[#777787] font-pixel text-[12px] ml-[10px]">CONECTADOS: 0</p>
        </div>
      </div>
      <!--caja de misiones-->
      <div class="bg-[#000208] w-80 h-40 absolute top-[250px] right-[50px] border border-3 border-[#2D2F4B] rounded-lg ">
        <div class="border-b-3 border-[#8450C2] ">
          <p class="text-[#8450C2] ml-10 mt-[5px] font-pixel text-[13px]">MISIONES DIARIAS</p>
        </div>
        <div class="flex items-center">
          <p class="text-[#6F89A5] ml-5 mt-[15px] font-pixel text-[10px]">JUEGA 2 PARTIDAS</p>
          <p class="text-[#6F89A5] font-pixel text-[10px] ml-20 mt-5">0/2</p>
        </div>
        <div class="flex items-center">
          <p class="text-[#6F89A5] ml-5 mt-[15px] font-pixel text-[10px]">ELIMINA 10 ENEMIGOS</p>
          <p class="text-[#6F89A5] font-pixel text-[10px] ml-12 mt-5">0/10</p>
        </div>
        <div class="flex items-center">
          <p class="text-[#6F89A5] ml-5 mt-[15px] font-pixel text-[10px]">GANA 1 PARTIDA</p>
          <p class="text-[#6F89A5] font-pixel text-[10px] ml-25 mt-5">0/1</p>
        </div>

      </div>
      <!--boton de juego-->
      <button class="bg-[#2A1A4B] h-15 w-80 absolute top-[700px] right-[50px] text-white font-pixel rounded-lg border border-4 border-[#B17BE3] transition-all duration-300 hover:text-white hover:shadow-[0_0_40px_#E2CCF6] hover:bg-[#B17BE3] hover:scale-105 hover:border-[#CDA3F3]" @click="irGameMode">JUGAR</button>
    </div>
  </section>
  </template> 