import IController from '../interfaces/IController.js'

/**
 * Controlador del jugador.
 * SRP: unica responsabilidad es manejar la entrada del jugador.
 * DIP: depende de InputService (abstraccion), no de Phaser teclas directo.
 * ISP: usa interfaces finas (IMovable, IAttackable, IInteractable) en lugar de Player concreto.
 */
export default class PlayerController extends IController {
  /**
   * @param {import('../interfaces/IMovable.js').default & import('../interfaces/IAttackable.js').default & import('../interfaces/IInteractable.js').default} entity
   * @param {import('../interfaces/IInputService.js').default} inputService
   */
  constructor(entity, inputService) {
    super()
    this.entity = entity
    this.inputService = inputService
    this.attackWasDown = false
  }

  /**
   * Lee input via InputService y ejecuta acciones en la entidad.
   * @param {number} _delta
   */
  handleInput(_delta) {
    if (!this.entity.isAlive()) {
      this.attackWasDown = false
      this.entity.cancelarCargaAtaque?.()
      return
    }
    this.entity.movement?.update()
    if (this.entity.recibiendoDano) {
      this.attackWasDown = false
      this.entity.cancelarCargaAtaque?.()
      return
    }

    // La dirección se actualiza incluso durante el ataque; así se puede atacar
    // caminando y cambiar hacia dónde mira el personaje sin cortar la animación.
    if (this.inputService.isMovingLeft()) {
      this.entity.moverIzquierda()
    } else if (this.inputService.isMovingRight()) {
      this.entity.moverDerecha()
    } else {
      this.entity.detenerMovimiento()
    }

    // Cosa 3 usa L tanto para el disparo normal como para iniciar la carga.
    if (this.entity.idleTexture === 'cosa3') {
      const ataquePresionado = this.inputService.isAttacking()
      const teclaAtaqueAbajo = this.inputService.isAttackDown()
      const ataqueSoltado = this.attackWasDown && !teclaAtaqueAbajo
      this.attackWasDown = teclaAtaqueAbajo

      this.entity.manejarEntradaAtaqueCosa3(
        ataquePresionado,
        teclaAtaqueAbajo,
        ataqueSoltado,
      )
    } else if (!this.entity.ataque && this.inputService.isAttacking()) {
      this.entity.atacar()
    }

    if (!this.entity.ataque && this.inputService.isJumping()) {
      this.entity.saltar()
    }

    if (this.inputService.isDroppingKey()) {
      this.entity.soltarLlave?.()
    }

    // Alinea el cuadro de salto de Cosa 2 sin cambiar su escala ni el tamaño del hitbox.
    this.entity.alignJumpSpriteWithHitbox?.()
  }

  reset() {
    this.entity.respawn?.()
  }
}
