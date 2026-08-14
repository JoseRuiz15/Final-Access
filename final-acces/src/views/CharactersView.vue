<script setup>
import { useRouter } from 'vue-router'
//import { onMounted } from 'vue'
const mostrarConfirmacion = ref(false)
const router = useRouter()

function irLoggin() {
  router.push('/login')
}
function irLobby() {
  router.push('/lobby')
}

function irStore() {
    router.push('/store')
}

import { ref } from 'vue'

const personajeSeleccionado = ref(0)

const personajes = [
  {
    nombre: 'Cosa 1',
    imagen: '/img/cosa1.png',
    perfil: '/img/Cosa1_perfil.png',
    habilidad: 'Puños de energia',
    descripcion: 'Su habilidad consiste en el ataque cuerpo a cuerpo, por lo que tiene que estar cerca del enemigo para inflingir daño.'
  },
  {
    nombre: 'Cosa 2',
    imagen: '/img/cosa2.png',
    perfil: '/img/Cosa2_perfil.png',
    habilidad: 'Sable de luz',
    descripcion: 'Su habilidad consiste en atacar con una espada de energia, es necesario estar cerca de los enemigos.'
  },
  {
    nombre: 'Cosa 3',
    imagen: '/img/cosa3.png',
    perfil: '/img/Cosa3_perfil.png',
    habilidad: 'Golpe espectral',
    descripcion: 'Un personaje ofensivo que causa mucho daño en poco tiempo, ideal para entrar fuerte en batalla.'
  }
]

//onMounted(() => {
  //initFlowbite()
//})

</script>

<template>
<section id="lobby-screen">
  <img
      src="/img/lobby2.png"
      alt="imagen del la tienda"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />

    <div class="relative z-10 min-h-screen">
      <header class="w-full h-[150px] bg-[#050711]/50 backdrop-blur-sm border-4 border-[#2D2F4B] flex items-center px-4"
      >
        <!-- Usuario -->
        <div
          class="bg-[#050711] w-[450px] h-[110px] border-4 border-[#2D2F4B] rounded-lg flex items-center"
        >
          <div class="w-[100px] h-[100px] border-3 border-[#444665] rounded-lg overflow-hidden">
            <img src="/img/perfil.png" alt="imagen de perfil" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col ml-10">
            <p class="text-white text-[30px] font-pixel">DIN_03</p>
            <p class="text-[#FB00FF] text-[14px] font-pixel mt-1">Nivel 1</p>
          </div>
        </div>

        <!-- Menú central -->
        <nav class="flex items-center gap-20 ml-16">
          <button @click="irLobby">
            <h1 class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]">
              INICIO
            </h1>
          </button>

          <button @click="irCharacters">
            <h1 class="text-[#FB00FF] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]">
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

          <button class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]">
            <img src="/img/ajustes.png" alt="ajustes" class="w-full h-full object-cover" />
          </button>

          <button class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]">
            <img src="/img/mensajes.png" alt="mensajes" class="w-full h-full object-cover" />
          </button>

          <button @click="mostrarConfirmacion = true" class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF]">
            <img src="/img/salida.png" alt="cierre de sesión" class="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      <!-- cuadro del centro -->
<div class="min-h-[calc(100vh-150px)] flex items-center justify-center">
  <div class="h-[480px] w-[1350px] bg-[#000313] border-4 border-[#20273C] rounded-lg flex">

    <!-- donde estan los personajes -->
    <div class="h-full w-[900px] flex items-center justify-center gap-10 px-10">

      <button
        v-for="(personaje, index) in personajes"
        :key="personaje.nombre"
        class="bg-black h-[300px] w-[200px] rounded-lg  transition-all duration-300 overflow-hidden"
        :class="personajeSeleccionado === index
          ? 'border-[#FF00D9] shadow-[0_0_35px_#FF00D9]'
          : 'border-transparent hover:border-[#FF00D9] hover:shadow-[0_0_35px_#FF00D9]'"
        @click="personajeSeleccionado = index"
      >
        <img
          :src="personaje.imagen"
          :alt="personaje.nombre"
          class="h-full w-full object-cover"
        >
      </button>
    </div>

    <!-- cuadro derecho -->
<div class="h-full flex-1 border-l-3 border-[#20273C] flex flex-col">

  <!-- cuadro de arriba -->
  <div class="h-1/2 border-b-3 border-[#20273C] flex">

    <!-- imagen de perfil del personaje -->
    <div class="w-1/2 h-full flex items-center justify-center">
      <div class="h-[130px] w-[130px] border-4 border-[#FF00D9] rounded-lg overflow-hidden shadow-[0_0_25px_#FF00D9]">
        <img
          :src="personajes[personajeSeleccionado].perfil"
          :alt="personajes[personajeSeleccionado].nombre"
          class="h-full w-full object-cover"
        >
      </div>
    </div>

    <!-- nombre y boton -->
    <div class="w-1/2 h-full flex flex-col items-center justify-center gap-6 px-4">
      <h2 class="text-[#FF00D9] font-pixel text-[22px] text-center">
        {{ personajes[personajeSeleccionado].nombre }}
      </h2>

      <button class="bg-[#2A1A4B] h-12 w-40 text-white font-pixel rounded-lg border-4 border-[#B17BE3] transition-all duration-300 hover:shadow-[0_0_30px_#FF00D9] hover:bg-[#FF00D9] hover:border-[#FF00D9]">
        EQUIPAR
      </button>
    </div>

  </div>

  <!-- cuadro de abajo -->
  <div class="h-1/2 p-8 flex flex-col justify-center">
    <h3 class="text-white font-pixel text-[16px] mb-4">
      HABILIDAD
    </h3>

    <p class="text-[#FF00D9] font-pixel text-[14px] mb-6">
      {{ personajes[personajeSeleccionado].habilidad }}
    </p>

    <p class="text-[#9898BD] font-pixel text-[12px] leading-6">
      {{ personajes[personajeSeleccionado].descripcion }}
    </p>
  </div>

</div>

  </div>
</div>


    </div>
</section>
<div v-if="mostrarConfirmacion" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

  <div class="w-[700px] h-[400px] bg-black border-4 border-[#8B7A91] rounded-lg">
    <h1 class="font-pixel text-[#FB00FF] text-3xl text-center mt-8">
      ¿ESTÁS SEGURO DE QUE QUIERES SALIR?
    </h1>

    <div class="flex flex-col items-center gap-8 mt-16">

      <button @click="irLoggin" class="font-pixel text-white w-[250px] h-[60px] bg-[#2A1A4B] rounded-xl border-2 border-fuchsia-500 transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF] hover:-translate-y-2">
        SI
      </button>

      <button
        @click="mostrarConfirmacion = false"
        class="font-pixel text-white w-[250px] h-[60px] bg-[#2A1A4B] rounded-xl border-2 border-fuchsia-500 transition-all duration-300 hover:border-fuchsia-500 hover:shadow-[0_0_20px_#FB00FF] hover:-translate-y-2"
      >
        NO
      </button>
    </div>
  </div>
</div>
</template>
