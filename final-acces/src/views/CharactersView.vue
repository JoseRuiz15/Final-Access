<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irLobby() {
  router.push('/lobby')
}
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
        <button class="absolute left-[500px] top-[90px]">
          <h1 class="text-[#876988] font-pixel hover:text-[#CF56D2] hover:text-shadow-[0_0_40px_#CF56D2]"@click="irLobby">INICIO</h1>
        </button>
        <!--para pasar donde los personajes-->
        <button class="absolute left-[700px] top-[90px]" >
          <h1 class="text-[#CF56D2] font-pixel">PERSONAJES</h1>
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
      <!--cuadro del centro-->
      <div class="flex items-center justify-center">
        <div class="h-100 w-250 bg-[#000313] mt-15 border border-4 border-[#20273C] rounded-lg flex">
            <!--donde estan los personajes-->
            <div class="h-full w-150 flex">
                <!--cosa 1-->
                <div class="bg-black h-10 mt-10 ml-10">
                    <img src="/img/cosa1.png" alt="imagen de cosa1"class="h-[250px]">
                </div>
                <!--cosa 2-->
                <div class="bg-black h-10 mt-10 ml-10">
                    <img src="/img/cosa2.png" alt="imagen de cosa2" class="h-[250px]">
                </div>
                <!--cosa 3-->
                <div class="bg-black h-10 mt-10 ml-10">
                    <img src="/img/cosa3.png" alt="imagen de cosa3"class="h-[250px]">
                </div>
                <!--caracteristicas de los personajes-->
            </div>
            <div class="h-full w-100 border-l-3 border-[#999999]">

            </div>
      </div>
      </div> 
      
      
    </div>
</section>
</template>