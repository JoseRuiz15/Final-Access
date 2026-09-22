export default class PlayerHealthComponent {
  constructor(player, gameRepository) {
    this.player = player
    this.gameRepository = gameRepository
    this.vida = 100
    this.maxVida = 100
    this.vidas = 5
    this.muerto = false
    this.recibiendoDano = false
  }

  takeDamage(amount) {
    if (this.muerto || this.recibiendoDano) return false

    this.vida -= amount
    if (this.vida <= 0) {
      this.vida = 0
      this.muerto = true
      this.player.setVelocity(0, 0)
      this.player.play('playerDead')
      this.player.scene.onPlayerDeath?.()
      return true
    }

    this.recibiendoDano = true
    this.player.setVelocity(0, 0)
    this.player.play('playerDamage')
    return false
  }

  recibirDano(dano) {
    if (this.muerto || this.recibiendoDano) return
    this.player.ataque = false
    this.vida -= dano

    if (this.vida <= 0) {
      this.vida = 0
      this.vidas--
      this.gameRepository.vidas = this.vidas
      this.muerto = true
      this.player.setVelocity(0, 0)
      this.player.play('playerDead')
    } else {
      this.recibiendoDano = true
      this.player.setVelocity(0, 0)
      this.player.play('playerDamage')
    }
  }

  respawn() {
    this.vida = 100
    this.player.setPosition(this.player.spawnX, this.player.spawnY)
    this.player.setVelocity(0, 0)
    this.player.setActive(true)
    this.player.setVisible(true)
    this.player.body.enable = true
    this.player.play('caminar', true)
    this.muerto = false
    this.recibiendoDano = false
    this.player.ataque = false
  }
}
