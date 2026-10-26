export default class EnemyHealthComponent {
  constructor(enemy, gameRepository) {
    this.enemy = enemy
    this.gameRepository = gameRepository
  }

  takeDamage(amount) {
    if (this.enemy.muerto || this.enemy.recibiendoDano) return false

    this.enemy.vida -= amount
    if (this.enemy.vida <= 0) {
      this.enemy.vida = 0
      this.enemy.muerto = true
      this.enemy.setVelocity(0)
      this.enemy.body.enable = false

      const scene = this.enemy.scene
      const deathAnim = this.enemy.animDie
      const hasDeathAnim = deathAnim && scene.anims.exists(deathAnim)

      if (hasDeathAnim) {
        this.enemy.play(deathAnim)
        this.enemy.once(`animationcomplete-${deathAnim}`, () => {
          scene.mostrarExplosion(this.enemy.x, this.enemy.y)
          this.gameRepository.incrementarEnemigos()
          this.enemy.destroy()
        })
      } else {
        scene.mostrarExplosion(this.enemy.x, this.enemy.y)
        this.gameRepository.incrementarEnemigos()
        this.enemy.destroy()
      }

      return true
    }

    this.enemy.recibiendoDano = true
    this.enemy.setVelocity(0)

    const scene = this.enemy.scene
    const damageAnim = this.enemy.animDamage
    if (damageAnim && scene.anims.exists(damageAnim)) {
      this.enemy.play(damageAnim)
    } else {
      // Enemigos sin animación de daño (por ejemplo, el dron) se recuperan
      // tras un breve tiempo para evitar recibir todos los golpes seguidos.
      scene.time.delayedCall(250, () => {
        if (this.enemy.active && !this.enemy.muerto) {
          this.enemy.recibiendoDano = false
        }
      })
    }

    return false
  }
}
