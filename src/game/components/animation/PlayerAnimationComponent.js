export default class PlayerAnimationComponent {
  constructor(player) {
    this.player = player
    this._setupListeners()
  }

  _setupListeners() {
    const finalizarAtaqueEnSuelo = () => {
      if (this.player.attack?.repetirAnimacionCargaCosa3()) return

      this.player.ataque = false
      if (!this.player.muerto) {
        this.player.setTexture(this.player.idleTexture)
        // Restablece el anclaje normal al salir del spritesheet ancho de ataque.
        this.player.alignJumpSpriteWithHitbox()
      }
    }

    this.player.on('animationcomplete-atacar', finalizarAtaqueEnSuelo)
    this.player.on('animationcomplete-atacarQuieto', finalizarAtaqueEnSuelo)

    this.player.on('animationcomplete-atacarAereo', () => {
      if (this.player.attack?.repetirAnimacionCargaCosa3()) return

      this.player.ataque = false
      if (this.player.muerto) return

      if (!this.player.movement.isGrounded()) {
        // Si sigue en el aire, vuelve a la animación de caída en vez de quedarse congelado.
        this.player.play('saltar', true)
        return
      }

      this.player.setTexture(this.player.idleTexture)
      this.player.alignJumpSpriteWithHitbox()
    })

    this.player.on('animationcomplete-playerDamage', () => {
      if (!this.player.muerto && this.player.body.blocked.down) {
        this.player.setTexture(this.player.idleTexture)
      }
      this.player.recibiendoDano = false
      this.player.setTexture(this.player.idleTexture)
    })

    this.player.on('animationcomplete-playerDead', () => {
      this.player.scene.onPlayerDeath?.()
    })
  }

  update() {}
}
