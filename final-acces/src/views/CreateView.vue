<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irMultiplayer() {
  router.push('/multiplayer')
}

function irCreate() {
  router.push('/create')
}
</script>
<template>
    <div class="relative min-h-screen">
    <!--imagen de fondo-->
    <img src="/img/partida.png" alt="FONDO" class="h-full w-full absolute inset-0 objet-cover -z-10">
    <!--volver-->
    <button class="absolute top-15 left-10 z-20 text-white font-pixel text-[13px] hover:text-[#FF00D9] hover:text-shadow-[0_0_30px_#FF00D9] transition-all duration-300" @click="irMultiplayer"><- VOLVER</button>
    <!--cuadro para crear partida-->
    <div class="absolute top-25 left-100 w-[1060px] h-[790px] bg-[#211525]/80 border border-[#3B494B] backdrop-blur-sm rounded-lg">
        <h1 class="text-[#BCDBFF] font-pixel text-[40px] text-center mt-10">CONFIGURACION DE PARTIDA</h1>
        <h1 class="text-[#ffffff] font-pixel text-[20px] ml-10 ">ESTABLECER PARAMETROS DEL SERVIDOR</h1>
        <div class="h-[1px] w-full bg-[#8B8A8A]"></div>

    </div>
    </div>
</template>