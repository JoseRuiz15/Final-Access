export default class MovementComponent {
  constructor(player) {
    this.player = player
    this.velocidad = 160
    this.jumpAnimationPlayed = false
    this.dashActivo = false
    this.direccionDash = 0
    this.dashTerminaEn = 0
    this.dashDisponibleEn = 0
    this.velocidadDash = 288
    this.duracionDash = 292
    this.recargaDash = 650
  }

  isGrounded() {
    const body = this.player.body
    const characterId = this.player.gameRepository?.selectedCharacterId
    const needsConfirmedGroundContact = characterId === 'cosa2' || characterId === 'cosa3'
    const groundContact =
      body?.blocked?.down || (!needsConfirmedGroundContact && body?.touching?.down)

    // Cosa 2 y 3 requieren apoyo confirmado para no contar un roce como suelo.
    return Boolean(groundContact && body?.velocity?.y >= 0)
  }

  moveLeft() {
    if (this.dashActivo) return
    this.player.setVelocityX(-this.velocidad)
    this.player.setFlipX(true)
    // Mantiene el desplazamiento, pero no sustituye la animación de ataque.
    if (this.isGrounded() && !this.player.ataque && !this.player.recibiendoDano) {
      this.player.play('caminar', true)
    }
  }

  moveRight() {
    if (this.dashActivo) return
    this.player.setVelocityX(this.velocidad)
    this.player.setFlipX(false)
    // Mantiene el desplazamiento, pero no sustituye la animación de ataque.
    if (this.isGrounded() && !this.player.ataque && !this.player.recibiendoDano) {
      this.player.play('caminar', true)
    }
  }

  stop() {
    if (this.dashActivo) return
    this.player.setVelocityX(0)
    if (this.isGrounded() && !this.player.ataque && !this.player.muerto) {
      if (this.player.anims.currentAnim?.key === 'saltar') {
        this.player.anims.stop()
      }
      this.player.setTexture(this.player.idleTexture)
    }
  }

  startDash(direction) {
    const ahora = this.player.scene.time.now
    if (
      this.player.idleTexture !== 'cosa3' ||
      ![-1, 1].includes(direction) ||
      ahora < this.dashDisponibleEn ||
      this.player.ataque ||
      this.player.recibiendoDano ||
      this.player.muerto ||
      !this.player.active
    ) {
      return false
    }

    this.dashActivo = true
    this.direccionDash = direction
    this.dashTerminaEn = ahora + this.duracionDash
    this.dashDisponibleEn = ahora + this.recargaDash
    this.player.setFlipX(direction < 0)
    this.player.setVelocityX(direction * this.velocidadDash)

    this.player.play('cosa3Dash', true)

    return true
  }

  cancelDash() {
    this.dashActivo = false
    this.direccionDash = 0
    this.dashTerminaEn = 0
  }

  jump() {
    if (this.isGrounded()) {
      this.player.setVelocityY(-500)
      this.player.play('saltar', true)
      this.jumpAnimationPlayed = true
    }
  }

  update() {
    if (this.dashActivo && this.player.scene.time.now >= this.dashTerminaEn) {
      this.cancelDash()
    }

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
