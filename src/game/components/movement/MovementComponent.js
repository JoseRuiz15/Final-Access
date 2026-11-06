import {
  createPlayerSoundLoop,
  playPlayerSoundEffect,
} from '../../services/PlayerSoundEffects.js'

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
    this.walkSound = null

    this.player.scene.events?.once('shutdown', () => this._destroyWalkSound())
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
    if (this.dashActivo) {
      this._stopWalkSound()
      return
    }
    this.player.setVelocityX(-this.velocidad)
    this.player.setFlipX(true)
    this._syncWalkSound()
    // Mantiene el desplazamiento, pero no sustituye la animación de ataque.
    if (this.isGrounded() && !this.player.ataque && !this.player.recibiendoDano) {
      this.player.play('caminar', true)
    }
  }

  moveRight() {
    if (this.dashActivo) {
      this._stopWalkSound()
      return
    }
    this.player.setVelocityX(this.velocidad)
    this.player.setFlipX(false)
    this._syncWalkSound()
    // Mantiene el desplazamiento, pero no sustituye la animación de ataque.
    if (this.isGrounded() && !this.player.ataque && !this.player.recibiendoDano) {
      this.player.play('caminar', true)
    }
  }

  stop() {
    if (this.dashActivo) {
      this._stopWalkSound()
      return
    }
    this.player.setVelocityX(0)
    this._stopWalkSound()
    if (
      this.isGrounded() &&
      !this.player.ataque &&
      !this.player.recibiendoDano &&
      !this.player.muerto
    ) {
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
    this._stopWalkSound()

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
      this._stopWalkSound()
      this.player.setVelocityY(-500)
      this.player.play('saltar', true)
      playPlayerSoundEffect(this.player.scene, 'jump')
      this.jumpAnimationPlayed = true
    }
  }

  update() {
    if (this.dashActivo && this.player.scene.time.now >= this.dashTerminaEn) {
      this.cancelDash()
    }

    this._syncWalkSound()

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

  _syncWalkSound() {
    const isWalking =
      this.isGrounded() &&
      Math.abs(this.player.body?.velocity?.x ?? 0) > 1 &&
      !this.dashActivo &&
      !this.player.muerto &&
      this.player.active

    if (isWalking) {
      if (!this.walkSound) {
        this.walkSound = createPlayerSoundLoop(this.player.scene, 'walk')
      }

      if (this.walkSound && !this.walkSound.isPlaying) this.walkSound.play()
      return
    }

    this._stopWalkSound()
  }

  _stopWalkSound() {
    if (this.walkSound?.isPlaying) this.walkSound.stop()
  }

  _destroyWalkSound() {
    this.walkSound?.destroy()
    this.walkSound = null
  }
}
