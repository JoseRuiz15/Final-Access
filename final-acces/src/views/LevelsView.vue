<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const mostrarModalNivel = ref(false)
const nivelSeleccionado = ref(null)

function irNivel1() {
    router.push('/nivel1')
}
function seleccionarNivel(nivel) {
    nivelSeleccionado.value = nivel
    mostrarModalNivel.value = true
}
function obtenerDescripcion() {
    switch (nivelSeleccionado.value) {
        case 1:
            return "En este nivel deberás infiltrarte en la base enemiga y eliminar a todos los guardias, conseguir la llave llegar a la salida."

        case 2:
            return "Debes rescatar a los rehenes antes de que se acabe el tiempo."

        case 3:
            return "Encuentra la salida del laboratorio sin ser detectado."

        case 4:
            return "Desactiva la bomba y derrota al jefe final."

        default:
            return "Descripción no disponible."
    }
}
</script>

<template>
    <section>
        <button class="absolute top-6 left-6 z-20 text-white font-pixel text-[13px] hover:text-[#FF00D9] hover:text-shadow-[0_0_30px_#FF00D9] transition-all duration-300" @click="irLobby">
                &lt;- VOLVER AL MENU
        </button>
        <div class="relative w-[1920px] h-[1080px]">
            <!--fondo del modo de juego-->
            <img src="/img/mapa.png" alt="imagen del fondo" class="w-full h-full">
            <!--Iconos de niveles-->

            <!-- Nivel 1 -->
            <button @click="seleccionarNivel(1)">
                <img src="/img/icono_level_1.png" alt="nivel 1" 
                class="absolute top-[30%] left-[18%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>

            <!-- Nivel 2 -->
            <button @click="seleccionarNivel(2)">
                <img src="/img/icono_level_2.png" alt="nivel 2" 
                class="absolute top-[37%] left-[24%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>

            <!-- Nivel 3 -->
            <button @click="seleccionarNivel(3)">
                <img src="/img/icono_level_3.png" alt="nivel 3" 
                class="absolute top-[45%] left-[19%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>  

            <!-- Nivel 4 -->
            <button @click="seleccionarNivel(4)">
                <img src="/img/icono_level_4.png" alt="nivel 4" 
                class="absolute top-[59%] left-[26%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>
            
            <!-- Nivel 5 -->
            <button @click="seleccionarNivel(5)">
                <img src="/img/icono_level_5.png" alt="nivel 5" 
                class="absolute top-[42%] left-[48%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>
            <!-- Nivel 6 BLOQUEADO -->
            <button>
                <img src="/img/nivel_bloqueado.png" alt="nivel 6" 
                class="absolute top-[48%] left-[58%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>

            <!-- Nivel 7 BLOQUEADO -->
            <button>
                <img src="/img/nivel_bloqueado.png" alt="nivel 7" 
                class="absolute top-[42%] left-[66%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>

            <!-- Nivel 8 BLOQUEADO -->
            <button>
                <img src="/img/nivel_bloqueado.png" alt="nivel 8" 
                class="absolute top-[33%] left-[74%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>

            <!-- Nivel 9 BLOQUEADO -->
            <button>
                <img src="/img/nivel_bloqueado.png" alt="nivel 9" 
                class="absolute top-[45%] left-[78%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>

            <!-- Nivel 10 BLOQUEADO -->
            <button>
                <img src="/img/nivel_bloqueado.png" alt="nivel 10" 
                class="absolute top-[75%] left-[80%] w-30 h-30 
                transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_#FF00D9]">
            </button>

        </div>

    </section>

    <!--MODAL PARA MOSTRAR INFORMACIÓN DE LOS NIVELES-->
        <!-- Modal -->
<div v-if="mostrarModalNivel" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

    <!-- Cuadro -->
    <div class="w-[800px] h-[500px] bg-black/70 border-4 border-[#585B7A] rounded-2xl p-8">

        <!-- Título -->
        <h1 class="font-pixel text-[#00AAFF] text-3xl text-center">
            NIVEL {{ nivelSeleccionado }}
        </h1>

        <!-- Contenido -->
        <div class="flex mt-8 gap-8">

            <!-- Imagen -->
            <div class="w-[300px] h-[250px] border-2 border-[#585B7A] rounded-lg overflow-hidden">
                <img
                    :src="`/img/MAPA_${nivelSeleccionado}.png`"
                    class="w-full h-full object-cover"
                >
            </div>

            <!-- Descripción -->
            <div class="flex-1">

                <h2 class="font-pixel text-white text-xl">
                    DESCRIPCIÓN
                </h2>

                <p class="text-white mt-6 leading-7 font-pixel text-sm">
                    {{ obtenerDescripcion() }}
                </p>

            </div>

        </div>

        <!-- Botones -->
        <div class="flex justify-center gap-10 mt-10">

            <button @click="irNivel1" class="w-[220px] h-14 bg-[#00AAFF] rounded-xl border-2 border-cyan-400 font-pixel  transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_#00AAFF] hover:-translate-y-2">
                JUGAR
            </button>

            <button @click="mostrarModalNivel = false" class="w-[220px] h-14 bg-[#2B2E46] rounded-xl border-2 border-gray-500 font-pixel text-white transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_#00AAFF] hover:-translate-y-2">
                CERRAR
            </button>
        </div>
    </div>
</div>
</template>