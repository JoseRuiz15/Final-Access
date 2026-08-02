
<script setup>
import { ref, onMounted} from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

    const dialogos = [
    {
        personaje: "/img/pose1.png",
        cuadro: "/img/textbox.png",
        texto: "Que tal cadete, bienvenido, es hora de empezar tu mision."
    },
    {
        personaje: "/img/pose2.png",
        cuadro: "/img/textbox.png",
        texto: "Para avanzar de nivel debes destruir cajas y econtrar llaves escondidas."
    },
    {
        personaje: "/img/pose3.png",
        cuadro: "/img/textbox.png",
        texto: "Si escoges llaves incorrectas pierdes tiempo, escoge bien y escapa antes de que el contador llegue a 0."
    },
    {
        personaje: "/img/pose4.png",
        cuadro: "/img/textbox.png",
        texto: "Ten cuidado con los enemigos, pierdes tiempo y  una vida cada que te disparan."
    },
    {
        personaje: "/img/pose5.png",
        cuadro: "/img/textbox.png",
        texto: "Buena suerte, escoje bien y completa todas las misiones"
    }

]

    const sonidoEscritura = new Audio("/audio/audioText.mp3")
    
    
    function reproducirSonido() {
        sonidoEscritura.currentTime = 0 
        sonidoEscritura.play()
    }

    const dialogoActual = ref(0)
    function ultimoDialogo() {
    return dialogoActual.value === dialogos.length - 1
}

    function siguienteDialogo() {

        if(ultimoDialogo()){
            return
        }

        dialogoActual.value++
        escribirTexto()
}

    const textoMostrado =ref("")

    function escribirTexto() {

        textoMostrado.value = ""
        let indice = 0
        const intervalo = setInterval(()=>{

            textoMostrado.value += dialogos[dialogoActual.value].texto[indice]
            reproducirSonido()
            indice++
            if(indice >= dialogos[dialogoActual.value].texto.length){
                clearInterval(intervalo)
            }
        },40)
        } 

onMounted(() => {
    escribirTexto()
})

function irExplicacionNivel(){

    router.push("/mission")

}

</script>


<template> 
    <section @click="siguienteDialogo">
        <img src = "/img/loadingscene.png" alt="loading" class="absolute inset-0 w-full h-full">
        <img :src="dialogos[dialogoActual].personaje" alt="loading" class="absolute top-[393px] left-[650px]">

        <div class="absolute top-[200px] left-[850px]">
            <img :src="dialogos[dialogoActual].cuadro" alt="loading" class="w-[780px] h-[250px]">
            <p class="absolute top-[20px] left-[50px] w-[700px] text-black font-pixel text-[20px] leading-8">
            {{ textoMostrado }}
             </p>
        </div>

        <button v-if="ultimoDialogo()" @click.stop="irExplicacionNivel"
        class="absolute bottom-20 right-20 text-white px-10 py-4 rounded-xl font-pixel transition-all duration-300 hover:text-white hover:bg-[#9747FF] hover:shadow-[0_0_25px_#9747FF] hover:scale-105">
        CONTINUAR
        </button>
        
    </section>
</template>