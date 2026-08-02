git <script setup>
import { useRouter } from 'vue-router'
import { ref } from "vue"

const router = useRouter()
const modo = ref("competitivo")

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
        <!--para colocar nombre al servidor-->
        <h1 class="text-[#00FFEA] font-pixel ml-10 mt-10 ">NOMBRE DEL SERVIDOR</h1>
        <div class="mt-[20px] ml-10">
          <input
            type="text"
            id="server"
            class="text-white font-orbitron login-input w-[960px] bg-[#675462]/30 rounded-[5px] h-[62px]"
          />
        </div>

        <!--escoger modo de juego-->

        <h1 class="text-[#00FFEA] font-pixel ml-10 mt-10 ">MODO DE JUEGO</h1>
        <div class="flex gap-8">

    <!-- Competitivo -->
    <div class="mt-5 ml-10"

        @click="modo = 'competitivo'"
        :class="[
            'w-[379px] h-[76px] rounded cursor-pointer flex items-center px-4 border-l-4 transition-all',
            modo === 'competitivo'
                ? 'border-cyan-300 bg-[#2B2746]'
                : 'border-cyan-900 bg-[#23203B]'
        ]"
    >
        <div
            :class="[
                'w-4 h-4 rounded-full border-2 mr-3',
                modo === 'competitivo'
                    ? 'bg-blue-500 border-white'
                    : 'border-white'
            ]"
        ></div>

        <span class="text-white font-pixel">
            COMPETITIVO
        </span>
    </div>

    <!-- Colaborativo -->
    <div class="mt-5 ml-20"
        @click="modo = 'colaborativo'"
        :class="[
            'w-[379px] h-[76px] rounded cursor-pointer flex items-center px-4 border-l-4 transition-all',
            modo === 'colaborativo'
                ? 'border-cyan-300 bg-[#2B2746]'
                : 'border-cyan-900 bg-[#23203B]'
        ]"
    >
        <div
            :class="[
                'w-4 h-4 rounded-full border-2 mr-3',
                modo === 'colaborativo'
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-white'
            ]"
        ></div>

        <span class="text-white font-pixel">
            COLABORATIVO
        </span>
    </div>

</div>

        <!--termina aqui-->
    </div>
    </div>
</template>