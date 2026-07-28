<script setup>
import { ref, onMounted} from 'vue'

    const textoCompleto = "Para pasar el nivel necesitas esta Llave de plata del grupo comun la cual podras encontrar en cajas que tendras que destruir."
    const textoMostrado = ref("")

    let indice = 0

    function escribirTexto(){
        const intervalo = setInterval(() => {
            if(indice < textoCompleto.length){
                textoMostrado.value += textoCompleto[indice]
                indice++
            } else {
                clearInterval(intervalo)
            }
        }, 40)

    } 
    
    onMounted(() => {
        escribirTexto()
    })
</script>


<template>
    <section>
        <img src = "/img/loadingscene.png" alt="mission" class="absolute inset-0 w-full h-full">
        <img src = "/img/tutorialPersonaje.png" alt="tutorial" class="absolute top-[460px] left-[650px] w-[500px]">

        <h1 class="absolute top-[200px] left-[750px] text-[50px] text-white font-pixel text-[30px]">NIVEL 1</h1>
        <div>
            <img src = "/img/textbox.png" alt="tutorial" class="absolute top-[280px] left-[750px]">

            <div>
                <p class="absolute top-[300px] left-[820px] w-[599px] text-black font-pixel text-[15px]">
                    {{ textoMostrado }}
                </p>
                <img src = "/img/Key1-SILVER.png" alt="llave" class="absolute top-[300px] left-[1430px] w-[30px]">
            </div>
        </div>

        <button class="absolute bottom-20 right-20 text-white px-10 py-4 rounded-xl font-pixel transition-all duration-300 hover:text-white hover:bg-[#9747FF] hover:shadow-[0_0_25px_#9747FF] hover:scale-105">
        JUGAR
        </button>

    </section>
</template>