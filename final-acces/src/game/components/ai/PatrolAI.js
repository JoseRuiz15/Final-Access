import Phaser from 'phaser'

export default class PatrolAI {
  constructor(enemy, config = {}) {
    this.enemy = enemy
    this.velocidad = config.velocidad || 50
    this.limiteIzquierdo = config.limiteIzquierdo || 670
    this.limiteDerecho = config.limiteDerecho || 1100
    this.direccion = 1
  }

  update() {
    if (this.enemy.muerto || this.enemy.recibiendoDano || this.enemy.atacando) {
      this.enemy.setVelocity(0)
      return
    }

    if (!this.enemy.target || !this.enemy.target.active) {
      // console.warn('Enemy sin target válido:', this.enemy.target)
      this.patrol()
      return
    }

    const distancia = Phaser.Math.Distance.Between(
      this.enemy.x,
      this.enemy.y,
      this.enemy.target.x,
      this.enemy.target.y,
    )

    if (distancia < 100) {
      this.enemy.setVelocityX(0)
      if (!this.enemy.anims.isPlaying || this.enemy.anims.currentAnim.key !== 'enemyAttack') {
        this.enemy.play('enemyAttack', true)
      }
      this.enemy.atacar()
      return
    }

    this.chase()
  }

  patrol() {
    this.enemy.setVelocityX(this.velocidad * this.direccion)
    this.enemy.setFlipX(this.direccion === 1)
    if (this.enemy.x <= this.limiteIzquierdo) this.direccion = 1
    if (this.enemy.x >= this.limiteDerecho) this.direccion = -1
    if (this.enemy.body.blocked.right) this.direccion = -1
    if (this.enemy.body.blocked.left) this.direccion = 1
    if (!this.enemy.anims.isPlaying) this.enemy.play('enemyWalk', true)
  }

  chase() {
    const dir = this.enemy.target.x < this.enemy.x ? -1 : 1
    this.direccion = dir
    this.enemy.setFlipX(dir === 1)
    this.enemy.setVelocityX(this.velocidad * this.direccion)
    if (!this.enemy.anims.isPlaying) this.enemy.play('enemyWalk', true)
  }
}
