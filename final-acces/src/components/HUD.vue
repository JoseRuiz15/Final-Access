<script setup>

//aqui empieza el tiempo

import { ref, computed, onMounted, onUnmounted } from "vue";
import { useGameStore } from "@/stores/game";

const tiempo = ref(285); // 5 minutos = 300 segundos

const tiempoFormateado = computed(() => {
  const minutos = Math.floor(tiempo.value / 60);
  const segundos = tiempo.value % 60;

  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
});

let intervalo;

onMounted(() => {
  intervalo = setInterval(() => {
    if (tiempo.value > 0) {
      tiempo.value--;
    } else {
      clearInterval(intervalo);
      console.log("¡Tiempo terminado!");
    }
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervalo);
});
// aqui termina
//vida 

const gameStore = useGameStore();

const vidas = computed(() => gameStore.vidas);

//llaves

const llaves = computed(() => gameStore.llaves);

//enemigos

const enemigos = computed(() => gameStore.enemigos);
</script>
<template>
  <div class="absolute top-5 left-0 w-full flex justify-center items-center gap-12 pointer-events-none">

    <div class="relative">
      <img src="/img/hudVidas.png" class="w-64">
      <!-- Aquí irá la vida -->
       <p class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold ml-[-150px] mt-[-50px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]">
        VIDAS
      </p>

      <!-- Corazones -->
      <div class="w-[24px] h-[24px] absolute mt-[-70px] ml-[10px] left-5 flex gap-2">

        <img
          v-for="vida in vidas"
          :key="vida"
          src="/img/Heart.png"
          class="w-6 h-6"
        >

      </div>


    </div>

    <div class="relative">
      <img src="/img/hudObjetivo.png" class="w-72">

      <img src="/img/Key10-GOLD.png" class=" absolute w-[18.64px] h-[31.75px] mt-[-70px] ml-[190px] rotate-40">
      <!-- Aquí irá la misión -->
       <p class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold ml-[-150px] mt-[-50px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]">
        OBJETIVO
      </p>
      <p class="font-pixel absolute inset-0 justify-center text-[8px] font-bold ml-[20px] mt-[50px] text-white text-shadow-[0_0_40px_#CF56D2]">
        CONSIGUE UNA LLAVE  
      </p>
      <p class="font-pixel absolute inset-0 flex text-[8px] font-bold ml-[20px] mt-[60px] text-white text-shadow-[0_0_40px_#CF56D2]">
         NORMAL DE COLOR
      </p>
      <p class="font-pixel absolute inset-0 flex text-[8px] font-bold ml-[20px] mt-[70px] text-white text-shadow-[0_0_40px_#CF56D2]">
         PLATEADO PARA PASAR
      </p>
      <p class="font-pixel absolute inset-0 flex text-[8px] font-bold ml-[20px] mt-[80px] text-white text-shadow-[0_0_40px_#CF56D2]">
         AL SIGUIENTE NIVEL
      </p>
      <p class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold ml-[150px] mt-[-50px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]">
        LLAVES
      </p>
      <p class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold ml-[190px] mt-[10px] text-white text-shadow-[0_0_40px_#00D9FF]">
        {{ llaves }}/1
      </p>
    </div>

    <div class="relative">
      <img src="/img/hudTiempo.png" class="w-64">

      <img src="/img/calavera.png" class=" absolute w-[30px] h-[13] mt-[-50px] ml-[120px]">
      <!-- Aquí irá el tiempo -->
       <p class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold  mt-[-80px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]">
        TIEMPO
      </p>
      <p
    class="font-pixel absolute inset-0 flex items-center justify-center
           text-xl text-white mt-[-20px]">
    {{ tiempoFormateado }}
  </p>
  
        <p class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold  mt-[50px] ml-[-120px] text-[#00D9FF] text-shadow-[0_0_40px_#00D9FF]">
        ENEMIGOS
      </p>
     <p class="font-pixel absolute inset-0 flex items-center justify-center text-[10px] font-bold  mt-[50px] ml-[80px] text-white text-shadow-[0_0_40px_#00D9FF]">
        {{ enemigos }}/3
      </p>
    
    </div>

  </div>
</template>

<script setup>
</script>
