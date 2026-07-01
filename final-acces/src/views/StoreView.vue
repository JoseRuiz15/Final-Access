<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

function irLobby() {
  router.push('/lobby')
}

function irCharacters() {
  router.push('/characters')
}
</script>

<template>
  <section>
    <!--fondo del tienda-->
    <img
      src="/img/lobby2.png"
      alt="imagen del la tienda"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />
    <!-- Contenido -->
    <div class="relative flex flex-col items-center justify-center">
      <!-- Barra superior -->
      <header
        class="w-full h-[150px] bg-[#050711]/50 backdrop-blur-sm border-4 border-[#2D2F4B] flex items-center px-4"
      >
        <!-- Usuario -->
        <div
          class="bg-[#050711] w-[450px] h-[110px] border-4 border-[#2D2F4B] rounded-lg flex items-center"
        >
          <div class="w-[100px] h-[100px] border-3 border-[#444665] rounded-lg overflow-hidden">
            <img src="/img/perfil.png" alt="imagen de perfil" class="w-full h-full object-cover" />
          </div>

          <h1 class="text-white ml-10 text-[30px]">DIN_03</h1>
        </div>

        <!-- Menú central -->
        <nav class="flex items-center gap-20 ml-16">
          <h1 class="text-[#FB00FF] font-pixel">INICIO</h1>

          <button @click="irCharacters">
            <h1
              class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
            >
              PERSONAJES
            </h1>
          </button>

          <button @click="irStore">
            <h1
              class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
            >
              TIENDA
            </h1>
          </button>
        </nav>

        <!-- Acciones derecha -->
        <div class="ml-auto flex items-center gap-8">
          <div class="flex items-center gap-2">
            <img src="/img/moneda.png" alt="puntos" class="h-[30px]" />
            <h1 class="font-pixel text-[20px] text-[#FB00FF]">12.000</h1>
          </div>

          <button class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden">
            <img src="/img/ajustes.png" alt="ajustes" class="w-full h-full object-cover" />
          </button>

          <button class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden">
            <img src="/img/mensajes.png" alt="mensajes" class="w-full h-full object-cover" />
          </button>

          <button class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden">
            <img src="/img/salida.png" alt="cierre de sesión" class="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      <!-- Paneles -->
      <div class="flex justify-center gap-10 mt-30">
        <!-- Panel izquierdo -->
        <div class="w-[650px] h-[470px] bg-black/70 rounded-lg border-2 border-gray-500 p-8">
          <!-- grid de 3 -->
          <div class="grid grid-cols-4 gap-8 ">
            
        <button class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white">SAMURAI</span>
            <span class="font-pixel text-[#973BE8]">Epica</span>
        </button>

        <button class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white">NOMADA</span>
            <span class="font-pixel text-[#973BE8]">Epica</span>
        </button>

        <button class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white">PIRATA</span>
            <span class="font-pixel text-[#973BE8]">Epica</span>
        </button>

        <button class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white">SELVA</span>
            <span class="font-pixel text-[#973BE8]">Rara</span>
        </button>

        <button class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px] leading-tight text-center">APOCALIPSIS</span>
            <span class="font-pixel text-[#973BE8] text-[10px] leading-tight text-center">Legendaria</span>
        </button>

            </div>
          </div>

          <!-- Panel derecho -->
        <div class="w-[300px] h-[470px] bg-black/70 rounded-lg border-2 border-gray-500">
            
        </div>

        </div>

        
      </div>

  </section>
</template>
