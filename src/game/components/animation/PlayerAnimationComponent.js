export default class PlayerAnimationComponent {
  constructor(player) {
    this.player = player
    this._setupListeners()
  }

  _setupListeners() {
    this.player.on('animationcomplete-atacar', () => {
      this.player.ataque = false
      if (!this.player.muerto) this.player.setTexture(this.player.idleTexture)
    })

    this.player.on('animationcomplete-playerDamage', () => {
      if (!this.player.muerto && this.player.body.blocked.down) {
        this.player.setTexture(this.player.idleTexture)
      }
      this.player.recibiendoDano = false
      this.player.setTexture(this.player.idleTexture)
    })

    this.player.on('animationcomplete-playerDead', () => {
      this.player.scene.onPlayerDeath?.()
    })
  }

  update() {}
}
