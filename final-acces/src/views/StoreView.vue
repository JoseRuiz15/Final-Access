<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { ref } from 'vue'

const personajeSeleccionado = ref(null)

function seleccionarPersonaje(personaje) {
    personajeSeleccionado.value = personaje
}

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
          <button @click="irLobby">
            <h1 class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]">
              INICIO
            </h1>
          </button>

          <button @click="irCharacters">
            <h1 class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]">
              PERSONAJES
            </h1>
          </button>

          <button @click="irStore">
            <h1
              class="text-[#FB00FF] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]"
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

        <button @click="seleccionarPersonaje('samurai')"class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px]">SAMURAI</span>
            <span class="font-pixel text-[#973BE8] text-[10px]">Epica</span>
        </button>

        <button @click="seleccionarPersonaje('nomada')" class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px]">NOMADA</span>
            <span class="font-pixel text-[#973BE8] text-[10px]">Epica</span>
        </button>

        <button @click="seleccionarPersonaje('pirata')" class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px]">PIRATA</span>
            <span class="font-pixel text-[#973BE8] text-[10px]">Epica</span>
        </button>

        <button @click="seleccionarPersonaje('selva')" class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px]">SELVA</span>
            <span class="font-pixel text-[#AEC87D] text-[10px]">Rara</span>
        </button>

        <button @click="seleccionarPersonaje('apocalipsis')" class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px] leading-tight text-center">APOCALIPSIS</span>
            <span class="font-pixel text-[#F7A129] text-[10px] leading-tight text-center">Legendaria</span>
        </button>

        <button @click="seleccionarPersonaje('tecnoangel')" class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px]">TECNOANGELO</span>
            <span class="font-pixel text-[#F7A129] text-[10px]">Legendaria</span>
        </button>

        <button @click="seleccionarPersonaje('nemesis')" class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px]">NEMESIS</span>
            <span class="font-pixel text-[#D02470] text-[10px]">Mitica</span>
        </button>

        <button @click="seleccionarPersonaje('eclipse')" class="w-32 h-32 bg-[#161C37] rounded-xl border-2 border-[#45495C] flex flex-col items-center justify-center transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[inset_0_0_20px_#FB00FF] hover:-translate-y-2">
            <span class="font-pixel text-white text-[10px]">ECLIPSE</span>
            <span class="font-pixel text-[#D02470] text-[10px]">Mitica</span>
        </button>


            </div>
          </div>

          <!-- Panel derecho -->
        <div class="grid grid-rows-[470px_auto] gap-4">
          <div class="w-[300px] h-[470px] bg-black/70 rounded-lg border-2 border-gray-500">
                <img v-if="personajeSeleccionado" :src="`/img/${personajeSeleccionado}.png`" alt="Personaje"  class="w-full h-full object-contain"/>
          </div>
           <button v-if="personajeSeleccionado" class="w-[220px] h-12 mt-4 bg-[#2E1E3E] rounded-xl border-2 border-fuchsia-500 flex items-center justify-center justify-self-center gap-3 transition-all duration-300 hover:border-fuchsia-400 hover:shadow-[0_0_20px_#FB00FF] hover:-translate-y-2">
                <img src="/img/moneda.png" class="w-6 h-6">
                <span class="font-pixel text-white">
                    12.000
                </span>
            </button>
        </div>
        </div>


      </div>

  </section>
</template>
