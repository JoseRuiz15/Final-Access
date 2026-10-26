export default class EnemyAnimationComponent {
  constructor(enemy) {
    this.enemy = enemy
    this._setupListeners()
  }

  _setupListeners() {
    const damageAnim = this.enemy.animDamage
    if (!damageAnim) return

    this.enemy.on(`animationcomplete-${damageAnim}`, () => {
      this.enemy.recibiendoDano = false
      if (!this.enemy.muerto && this.enemy.animWalk) {
        this.enemy.play(this.enemy.animWalk, true)
      }
    })
  }

  update() {}
}
