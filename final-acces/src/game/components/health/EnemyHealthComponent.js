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

      // Play death animation if exists, otherwise direct to explosion
      const hasDeathAnim = this.enemy.scene.anims.exists('enemyDie')
      if (hasDeathAnim) {
        this.enemy.play('enemyDie')
        this.enemy.once('animationcomplete-enemyDie', () => {
          this.enemy.scene.mostrarExplosion(this.enemy.x, this.enemy.y)
          this.gameRepository.incrementarEnemigos()
          this.enemy.destroy()
        })
      } else {
        // Fallback: direct explosion
        this.enemy.scene.mostrarExplosion(this.enemy.x, this.enemy.y)
        this.gameRepository.incrementarEnemigos()
        this.enemy.destroy()
      }

      return true
    }

    this.enemy.recibiendoDano = true
    this.enemy.setVelocity(0)
    this.enemy.play('enemyDamage')
    return false
  }
}
