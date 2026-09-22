export default class PlayerAnimationComponent {
  constructor(player) {
    this.player = player
    this._setupListeners()
  }

  _setupListeners() {
    this.player.on('animationcomplete-atacar', () => {
      this.player.ataque = false
      if (!this.player.muerto) this.player.setTexture('player')
    })

    this.player.on('animationcomplete-playerDamage', () => {
      if (!this.player.muerto && this.player.body.blocked.down) this.player.setTexture('player')
      this.player.recibiendoDano = false
      this.player.setTexture('player')
    })

    this.player.on('animationcomplete-playerDie', () => {
      this.player.scene.onPlayerDeath?.()
    })
  }

  update() {}
}
