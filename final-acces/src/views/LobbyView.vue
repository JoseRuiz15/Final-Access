<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'
import { ref } from 'vue'
const mostrarConfirmacion = ref(false)
const router = useRouter()

function irGameMode() {
  router.push('/gamemode')
}

function irCharacters() {
  router.push('/characters')
}

function irStore() {
  router.push('/store')
}

function irLoggin() {
  router.push('/login')
}

onMounted(() => {
  initFlowbite()
})
</script>

<template>
  <section id="lobby-screen" class="relative min-h-screen overflow-hidden">
    <!--fondo del lobby-->
    <img
      src="/img/lobby2.png"
      alt="imagen del lobby"
      class="absolute inset-0 w-full h-full object-cover -z-10"
    />

    <!-- Contenido general -->
    <div class="relative min-h-screen flex flex-col">
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

          <button @click="mostrarConfirmacion = true" class="w-[50px] h-[50px] border-3 border-[#41334B] rounded-lg overflow-hidden">
            <img src="/img/salida.png"
                alt="cierre de sesión"
                class="w-full h-full object-cover"/>
          </button>
        </div>
      </header>

      <!-- Contenido principal -->
      <main class="flex justify-between px-10 pt-20 flex-1">
        <!-- Lado izquierdo -->
        <section class="flex flex-col gap-10">
          <button class="h-20 w-80 border-4 border-[#00FFEA] bg-[#000004] rounded-lg flex items-center transition-all duration-300 hover:shadow-[0_0_20px_#00FFEA] hover:-translate-y-2">
            <div class="h-15 w-15 ml-[10px] rounded-lg">
              <img src="/img/clasificatoria.png" alt="imagen" />
            </div>

            <h1 class="text-[#9898BD] font-pixel text-[15px] ml-[10px]">CLASIFICATORIA</h1>
          </button>

          <button class="h-20 w-80 border-4 border-[#00FFEA] bg-[#000004] rounded-lg flex items-center transition-all duration-300 hover:shadow-[0_0_20px_#00FFEA] hover:-translate-y-2">
            <div class="h-15 w-15 ml-[10px] rounded-lg">
              <img src="/img/amigos.png" alt="imagen" />
            </div>

            <div class="ml-[10px]">
              <h1 class="text-[#9898BD] font-pixel text-[15px]">AMIGOS</h1>

              <p class="text-[#777787] font-pixel text-[12px]">CONECTADOS: 0</p>
            </div>
          </button>
        </section>

        <!-- Lado derecho -->
        <section class="flex flex-col items-center gap-20">
          <!-- Misiones -->
          <section
            class="bg-[#000208] w-80 h-52 border-3 border-[#2D2F4B] rounded-lg flex flex-col"
          >
            <div class="border-b-[3px] border-[#8450C2] py-2 px-5">
              <p class="font-pixel text-[13px] text-[#8450C2]">MISIONES DIARIAS</p>
            </div>

            <div class="p-5 space-y-5">
              <!-- Misión 1 -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <p class="font-pixel text-[10px] text-[#6F89A5]">JUEGA 2 PARTIDAS</p>

                  <p class="font-pixel text-[10px] text-[#6F89A5]">1/2</p>
                </div>

                <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                  <div class="h-full w-1/2 bg-[#A255F8] rounded-full"></div>
                </div>
              </div>

              <!-- Misión 2 -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <p class="font-pixel text-[10px] text-[#6F89A5]">ELIMINA 10 ENEMIGOS</p>

                  <p class="font-pixel text-[10px] text-[#6F89A5]">4/10</p>
                </div>

                <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                  <div class="h-full w-[40%] bg-[#A255F8] rounded-full"></div>
                </div>
              </div>

              <!-- Misión 3 -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <p class="font-pixel text-[10px] text-[#6F89A5]">GANA 1 PARTIDA</p>

                  <p class="font-pixel text-[10px] text-[#6F89A5]">0/1</p>
                </div>

                <div class="w-full h-[7px] bg-[#1E2034] rounded-full overflow-hidden">
                  <div class="h-full w-0 bg-[#A255F8] rounded-full"></div>
                </div>
              </div>
            </div>
          </section>

          <!-- Carrusel de imagenes de la tienda -->

          <div id="default-carousel" class="relative w-80 h-52" data-carousel="slide">
            <!-- Carousel wrapper -->
            <div
              class="relative w-full h-full overflow-hidden rounded-lg border-3 border-[#2D2F4B] bg-[#000208]"
            >
              <!-- Item 1 -->
              <div class="hidden duration-400 ease-in-out" data-carousel-item="active">
                <img
                  src="/img/tienda1.png"
                  class="absolute inset-0 block w-full h-full object-cover cursor-pointer"
                  alt="tienda 1"
                  @click="irStore"
                />
              </div>

              <!-- Item 2 -->
              <div class="hidden duration-400 ease-in-out" data-carousel-item>
                <img
                  src="/img/tienda2.png"
                  class="absolute inset-0 block w-full h-full object-cover cursor-pointer"
                  alt="tienda 2"
                  @click="irStore"
                />
              </div>

              <!-- Item 3 -->
              <div class="hidden duration-400 ease-in-out" data-carousel-item>
                <img
                  src="/img/tienda3.png"
                  class="absolute inset-0 block w-full h-full object-cover cursor-pointer"
                  alt="tienda 3"
                  @click="irStore"
                />
              </div>
            </div>
            <!-- Slider indicators -->
            <div class="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
              <button
                type="button"
                class="w-3 h-3 rounded-full bg-white/70"
                aria-current="true"
                aria-label="Slide 1"
                data-carousel-slide-to="0"
              ></button>

              <button
                type="button"
                class="w-3 h-3 rounded-full bg-white/70"
                aria-current="false"
                aria-label="Slide 2"
                data-carousel-slide-to="1"
              ></button>

              <button
                type="button"
                class="w-3 h-3 rounded-full bg-white/70"
                aria-current="false"
                aria-label="Slide 3"
                data-carousel-slide-to="2"
              ></button>
            </div>
            <!-- Slider controls -->
            <button
              type="button"
              class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
              data-carousel-prev
            >
              <span
                class="inline-flex items-center justify-center w-10 h-10 rounded-base bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"
              >
                <svg
                  class="w-5 h-5 text-white rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m15 19-7-7 7-7"
                  />
                </svg>
                <span class="sr-only">Previous</span>
              </span>
            </button>
            <button
              type="button"
              class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
              data-carousel-next
            >
              <span
                class="inline-flex items-center justify-center w-10 h-10 rounded-base bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"
              >
                <svg
                  class="w-5 h-5 text-white rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m9 5 7 7-7 7"
                  />
                </svg>
                <span class="sr-only">Next</span>
              </span>
            </button>
          </div>

          <!-- Botón jugar -->
          <button
            class="bg-[#2A1A4B] h-15 w-80 text-white font-pixel rounded-lg border-4 border-[#B17BE3] transition-all duration-300 hover:text-white hover:shadow-[0_0_40px_#E2CCF6] hover:bg-[#B17BE3] hover:scale-105 hover:border-[#CDA3F3]"
            @click="irGameMode"
          >
            JUGAR
          </button>
        </section>
      </main>
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
