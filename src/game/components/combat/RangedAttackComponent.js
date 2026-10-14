import EntityFactory from '../../factories/EntityFactory.js'

export default class RangedAttackComponent {
  constructor(enemy) {
    this.enemy = enemy
    this.atacando = false
    this.puedeDisparar = true
  }

  atacar() {
    if (this.atacando || this.enemy.muerto || this.enemy.recibiendoDano) return
    if (!this.puedeDisparar) return

    this.atacando = true
    this.puedeDisparar = false
    this.enemy.play('enemyAttack')

    const dir = this.enemy.target.x < this.enemy.x ? -1 : 1
    this.enemy.direccion = dir
    this.enemy.setFlipX(dir === 1)

    const origenX = this.enemy.x + 18 * dir
    const origenY = this.enemy.y + 3

    const bala = EntityFactory.createProjectile(this.enemy.scene, origenX, origenY, 'proyectile')
    bala.disparar(dir)

    this.enemy.scene.physics.add.overlap(bala, this.enemy.target, (_, player) => {
      player.recibirDano(this.enemy.dano)
      bala.destroy()
    })

    this.enemy.scene.time.delayedCall(800, () => {
      this.atacando = false
    })
    this.enemy.scene.time.delayedCall(1500, () => {
      this.puedeDisparar = true
    })
  }
}
