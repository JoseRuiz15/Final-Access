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
    if (!this.enemy.target?.active) return

    const scene = this.enemy.scene
    const target = this.enemy.target

    this.atacando = true
    this.puedeDisparar = false
    this.enemy.atacando = true

    const dir = target.x < this.enemy.x ? -1 : 1
    this.enemy.direccion = dir
    this.enemy.setFlipX(dir === 1)

    // El enemigo base reproduce su animación de ataque; el dron usa un
    // efecto independiente delante del cuerpo.
    this.enemy.playAttackAnimation()

    const fire = () => {
      if (!this.enemy.active || this.enemy.muerto || !target.active) return

      const muzzleX = this.enemy.muzzleOffsetX ?? 18
      const muzzleY = this.enemy.muzzleOffsetY ?? 3
      const bala = EntityFactory.createProjectile(
        scene,
        this.enemy.x + muzzleX * dir,
        this.enemy.y + muzzleY,
        this.enemy.projectileTexture ?? 'enemy2Bullet',
        this.enemy.projectileOptions ?? {},
      )

      if (this.enemy.aimAtTarget) {
        bala.dispararHacia(target.x, target.y)
      } else {
        bala.disparar(dir)
      }

      scene.physics.add.overlap(bala, target, (_, player) => {
        if (!player.active) return
        player.recibirDano(this.enemy.dano)
        bala.destroy()
      })
    }

    const fireDelay = this.enemy.fireDelay ?? 0
    if (fireDelay > 0) {
      scene.time.delayedCall(fireDelay, fire)
    } else {
      fire()
    }

    scene.time.delayedCall(this.enemy.attackLockMs ?? 800, () => {
      this.atacando = false
      this.enemy.atacando = false
    })
    scene.time.delayedCall(this.enemy.attackCooldown ?? 1500, () => {
      this.puedeDisparar = true
    })
  }
}
