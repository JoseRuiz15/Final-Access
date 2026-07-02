<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

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
</script>

<template>
<section id="lobby-screen">
    
    
    <div class="relative z-10 min-h-screen">
      <!--fondo del lobby-->
      <img src="/img/lobbyjuego.png" alt="imagen del lobby" class="absolute inset-0 w-full h-full object-cover -z-10">

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
        <nav class="flex items-center gap-20 ml-16">
                <button @click="irLobby">
                  <h1 class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]">INICIO</h1>
                </button>
                <!--para pasar donde los personajes-->
                <button>
                  <h1 class="text-[#FB00FF] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]">PERSONAJES</h1>
                </button>
                <!--para pasar a la tienda-->
                <button @click="irStore">
                  <h1 class="text-[#876988] font-pixel hover:text-[#FB00FF] hover:text-shadow-[0_0_40px_#CF56D2]">TIENDA</h1>
                </button>
        </nav>
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
</template>