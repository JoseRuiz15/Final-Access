<template>
  <h1>Lobby</h1>
  <section id="lobby-screen">
    <!--fondo-->
    <img src="/img/lobbyjuego.png" alt="imagen del lobby" class="absolute inset-0 w-full h-full object-cover">
    <!--cuadro de lobby-->
    <div class="relative min-h-screen">
      <div class="w-full h-[150px] bg-[#050711]/50 backdrop-blur-sm border border-4 border-[#2D2F4B] flex items-center justifi-center ">
        <!--cuadro de ususario-->
        <div class="bg-[#050711] w-[450px] h-[100px] border border-4 border-[#2D2F4B] ml-[10px] rounded-lg flex items-center">
          <!--cuadro de foto de perfil-->
          <div class="w-[100px] h-[90px] border border-3 border-[#444665] rounded-lg">
            <img src="" alt="imagende perfil">
          </div>
          <!--texto del nombre proximo a cambio-->
          <h1 class="text-white text-start ml-10 text-[30px]">DIN_03</h1>
        </div>
        <!--inico-->
        <div class=" ml-25 mt-15">
          <h1 class="text-[#CF56D2] font-pixel">INICIO</h1>
        </div>
        <!--para pasar donde los personajes-->
        <button class=" ml-15 mt-15">
          <h1 class="text-[#876988] font-pixel">PERSONAJES</h1>
        </button>
        <!--para pasar a la tienda-->
        <button class=" ml-15 mt-15">
          <h1 class="text-[#876988] font-pixel">TIENDA</h1>
        </button>
        <!--puntos-->
        <div>
          <h1 class="font-pixel text-[20px] text-[#FB00FF] ml-30">12.000</h1>
        </div>
        <!--ajustes, mensajes y cierre de secion-->
        <div class="w-[50px] h-[50px] border border-3 border-[#41334B] rounded-lg ml-10">
          <img src="" alt="imagen de ajustes">
        </div>
        <div class="w-[50px] h-[50px] border border-3 border-[#41334B] rounded-lg ml-5">
          <img src="" alt="imagen de mensajes">
        </div>
        <div class="w-[50px] h-[50px] border border-3 border-[#41334B] rounded-lg ml-5">
          <img src="" alt="imagen de cierre de secion">
        </div>


      </div>
    </div>
  </section>
</template>
eun
