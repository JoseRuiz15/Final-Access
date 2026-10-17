<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const dialogos = [
  {
    personaje: '/img/present/pose1.png',
    cuadro: '/img/textbox/textbox.png',
    texto: 'Que tal cadete, bienvenido, es hora de empezar tu mision.',
  },
  {
    personaje: '/img/present/pose2.png',
    cuadro: '/img/textbox/textbox.png',
    texto: 'Para avanzar de nivel debes destruir cajas y econtrar llaves escondidas.',
  },
  {
    personaje: '/img/present/pose3.png',
    cuadro: '/img/textbox/textbox.png',
    texto:
      'Si escoges llaves incorrectas pierdes tiempo, escoge bien y escapa antes de que el contador llegue a 0.',
  },
  {
    personaje: '/img/present/pose4.png',
    cuadro: '/img/textbox/textbox.png',
    texto: 'Ten cuidado con los enemigos, pierdes tiempo y una vida cada que te disparan.',
  },
  {
    personaje: '/img/present/pose5.png',
    cuadro: '/img/textbox/textbox.png',
    texto: 'Buena suerte, escoge bien y completa todas las misiones',
  },
]

const sonidoEscritura = new Audio('/audio/audioText.mp3')
let intervaloEscritura = null

function reproducirSonido() {
  sonidoEscritura.currentTime = 0
  sonidoEscritura.play()
}

const dialogoActual = ref(0)
function ultimoDialogo() {
  return dialogoActual.value === dialogos.length - 1
}

function siguienteDialogo() {
  const textoActual = dialogos[dialogoActual.value].texto

  // El primer clic completa la frase actual, sin crear otro temporizador.
  if (textoMostrado.value.length < textoActual.length) {
    clearInterval(intervaloEscritura)
    intervaloEscritura = null
    textoMostrado.value = textoActual
    return
  }

  if (ultimoDialogo()) {
    return
  }

  dialogoActual.value++
  escribirTexto()
}

const textoMostrado = ref('')

function escribirTexto() {
  clearInterval(intervaloEscritura)
  textoMostrado.value = ''
  let indice = 0
  const texto = dialogos[dialogoActual.value].texto

  intervaloEscritura = setInterval(() => {
    if (indice < texto.length) {
      textoMostrado.value = texto.slice(0, indice + 1)
      reproducirSonido()
      indice++
    } else {
      clearInterval(intervaloEscritura)
      intervaloEscritura = null
    }
  }, 40)
}

onMounted(() => {
  escribirTexto()
})

onUnmounted(() => {
  clearInterval(intervaloEscritura)
  sonidoEscritura.pause()
})

function irExplicacionNivel() {
  router.push('/mission')
}
</script>

<template>
  <section class="tutorial-screen fixed inset-0 overflow-hidden" @click="siguienteDialogo">
    <img
      src="/img/present/loadingscene.png"
      alt="loading"
      class="absolute inset-0 h-full w-full scale-105 object-cover blur-[4px]"
    />
    <img
      :src="dialogos[dialogoActual].personaje"
      alt="loading"
      class="tutorial-character absolute top-[393px] left-[650px]"
    />

    <div class="tutorial-dialogue absolute top-[200px] left-[850px] w-[780px] h-[250px]">
      <img
        :src="dialogos[dialogoActual].cuadro"
        alt="loading"
        class="absolute inset-0 w-full h-full"
      />
      <div class="absolute left-12 right-12 top-6 bottom-6 overflow-y-auto">
        <p
          class="min-h-full -translate-y-10 flex items-center justify-center px-4 text-center text-black font-pixel text-[20px] leading-8 break-words"
        >
          <span class="w-full">{{ textoMostrado }}</span>
        </p>
      </div>
    </div>

    <button
      v-if="ultimoDialogo()"
      @click.stop="irExplicacionNivel"
      class="tutorial-continue absolute bottom-20 right-20 text-white px-10 py-4 rounded-xl font-pixel transition-all duration-300 hover:text-white hover:bg-[#9747FF] hover:shadow-[0_0_25px_#9747FF] hover:scale-105"
    >
      CONTINUAR
    </button>
  </section>
</template>
