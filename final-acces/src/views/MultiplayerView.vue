<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irLobby() {
  router.push('/lobby')
}
</script>
<template>
    <!--fondo del multijugador-->
    <img src="/img/partida.png" alt="imagen del multi" class="h-full w-full absolute inset-0 objet-cover">

    <div class="relative min-h-screen">
        <button class="text-white font-pixel text-[13px] mt-10 ml-10" @click="irLobby"><-  VOLVER AL MENU</button>

    </div>
</template>