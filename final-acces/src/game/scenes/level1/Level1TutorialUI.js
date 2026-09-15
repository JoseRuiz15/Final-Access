/**
 * Clase encargada de las imágenes tutorial del Level 1.
 * Muestra flechas y botones para instruir al jugador.
 */
export default class Level1TutorialUI {

  constructor(scene) {
    this.scene = scene
    this.elements = {}
  }

  create() {
    this.elements.imgSaltar = this.scene.add.image(530, 800, 'imgSaltar')
    this.elements.imgSaltar.setScale(0.25)

    this.elements.imgDerecha = this.scene.add.image(300, 600, 'imgDerecha')
    this.elements.imgDerecha.setScale(0.25)

    this.elements.imgIzquierda = this.scene.add.image(150, 600, 'imgIzquierda')
    this.elements.imgIzquierda.setScale(0.25)

    this.elements.imgAtacar = this.scene.add.image(700, 650, 'imgAtacar')
    this.elements.imgAtacar.setScale(0.25)

    this.elements.imgInsertarLlave = this.scene.add.image(1600, 500, 'imgInsertarLlave')
    this.elements.imgInsertarLlave.setScale(0.25)

    // Ocultar inicialmente
    this.hideAll()
  }

  hideAll() {
    Object.values(this.elements).forEach(el => el.setVisible(false))
  }

  show(key) {
    this.hideAll()
    if (this.elements[key]) this.elements[key].setVisible(true)
  }

  setLlaveCercanaVisible(visible) {
    if (this.elements.imgRecogerLlave) {
      this.elements.imgRecogerLlave.setVisible(visible)
    }
  }
}