export default class EnemyAnimationComponent {
  constructor(enemy) {
    this.enemy = enemy
    this._setupListeners()
  }

  _setupListeners() {
    this.enemy.on('animationcomplete-enemyDamage', () => {
      this.enemy.recibiendoDano = false
      if (!this.enemy.muerto) this.enemy.play('enemyWalk')
    })
  }

  update() {}
}
