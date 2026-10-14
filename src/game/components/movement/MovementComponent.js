export default class MovementComponent {
  constructor(player) {
    this.player = player
    this.velocidad = 160
  }

  moveLeft() {
    this.player.setVelocityX(-this.velocidad)
    this.player.setFlipX(true)
    if (this.player.body.blocked.down) {
      this.player.play('caminar', true)
    }
  }

  moveRight() {
    this.player.setVelocityX(this.velocidad)
    this.player.setFlipX(false)
    if (this.player.body.blocked.down) {
      this.player.play('caminar', true)
    }
  }

  stop() {
    this.player.setVelocityX(0)
    if (this.player.body.blocked.down && !this.player.ataque && !this.player.muerto) {
      this.player.setTexture('player')
    }
  }

  jump() {
    if (this.player.body.blocked.down) {
      this.player.setVelocityY(-500)
      this.player.play('saltar', true)
    }
  }

  update() {
    if (!this.player.body.blocked.down && !this.player.ataque) {
      this.player.play('saltar', true)
    }
  }
}
