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
  }

  /**
   * Lee input via InputService y ejecuta acciones en la entidad.
   * @param {number} _delta
   */
  handleInput(_delta) {
    if (!this.entity.isAlive()) return
    if (this.entity.recibiendoDano) return
    if (this.entity.ataque) return

    if (this.inputService.isAttacking()) {
      this.entity.atacar()
      return
    }

    if (this.inputService.isMovingLeft()) {
      this.entity.moverIzquierda()
    } else if (this.inputService.isMovingRight()) {
      this.entity.moverDerecha()
    } else {
      this.entity.detenerMovimiento()
    }

    if (this.inputService.isJumping()) {
      this.entity.saltar()
    }

    if (!this.entity.body?.blocked?.down && !this.entity.ataque) {
      this.entity.play?.('saltar', true)
    }
  }

  reset() {
    this.entity.respawn?.()
  }
}
