export default class MovementComponent {
  constructor(player) {
    this.player = player
    this.velocidad = 160
    this.jumpAnimationPlayed = false
  }

  isGrounded() {
    const body = this.player.body
    const touchingGround = body?.blocked?.down || body?.touching?.down

    // Evita que el contacto del frame anterior cuente como suelo justo al despegar.
    return Boolean(touchingGround && body.velocity.y >= 0)
  }

  moveLeft() {
    this.player.setVelocityX(-this.velocidad)
    this.player.setFlipX(true)
    if (this.isGrounded()) {
      this.player.play('caminar', true)
    }
  }

  moveRight() {
    this.player.setVelocityX(this.velocidad)
    this.player.setFlipX(false)
    if (this.isGrounded()) {
      this.player.play('caminar', true)
    }
  }

  stop() {
    this.player.setVelocityX(0)
    if (this.isGrounded() && !this.player.ataque && !this.player.muerto) {
      if (this.player.anims.currentAnim?.key === 'saltar') {
        this.player.anims.stop()
      }
      this.player.setTexture(this.player.idleTexture)
    }
  }

  jump() {
    if (this.isGrounded()) {
      this.player.setVelocityY(-500)
      this.player.play('saltar', true)
      this.jumpAnimationPlayed = true
    }
  }

  update() {
    if (this.isGrounded()) {
      // Se permite reproducir la animación otra vez en el próximo salto.
      this.jumpAnimationPlayed = false
      return
    }

    if (
      this.player.ataque ||
      this.player.recibiendoDano ||
      this.player.muerto ||
      this.jumpAnimationPlayed
    ) {
      return
    }

    // Si cae de una plataforma, reproduce el salto una sola vez; no reinicia
    // la animación si termina antes de que el jugador toque el suelo.
    if (this.player.anims.currentAnim?.key !== 'saltar') {
      this.player.play('saltar', true)
    }
    this.jumpAnimationPlayed = true
  }
}
