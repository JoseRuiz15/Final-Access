import { playPlayerSoundEffect } from '../../services/PlayerSoundEffects.js'

export default class PlayerHealthComponent {
  constructor(player, gameRepository) {
    this.player = player
    this.gameRepository = gameRepository
    this.vida = 100
    this.maxVida = 100
    this.maxVidas = player.scene.config?.vidasIniciales ?? 5

    this.muerto = false
    this.recibiendoDano = false
    this.invulnerableHasta = 0

    this.vidas = Math.min(this.gameRepository.vidas ?? this.maxVidas, this.maxVidas)
    this.gameRepository.vidas = this.vidas
  }

  puedeRecibirDano() {
    const ahora = this.player.scene.time?.now ?? Date.now()
    if (this.muerto || ahora < this.invulnerableHasta) return false

    this.invulnerableHasta = ahora + 1500
    return true
  }

  takeDamage(amount) {
    if (!this.puedeRecibirDano()) return false

    playPlayerSoundEffect(this.player.scene, 'hurt')
    this.vida -= amount
    if (this.vida <= 0) {
      this.vida = 0
      this.muerto = true
      this.player.movement?.cancelDash()
      this.player.setVelocity(0, 0)
      this.player.play('playerDead')
      //this.player.scene.onPlayerDeath?.()
      return true
    }

    this.recibiendoDano = true
    this.player.play('playerDamage')
    return false
  }

  recibirDano(dano) {
    if (!this.puedeRecibirDano()) return

    playPlayerSoundEffect(this.player.scene, 'hurt')
    this.player.ataque = false
    this.vida -= dano

    if (this.vida <= 0) {
      this.vida = 0
      this.vidas = Math.max(0, this.vidas - 1)
      //this.vidas--

      this.gameRepository.vidas = this.vidas
      playPlayerSoundEffect(this.player.scene, 'lifeLost')
      this.player.scene.events?.emit('player-life-lost', this.vidas)

      this.muerto = true
      this.player.movement?.cancelDash()
      this.player.setVelocity(0, 0)
      this.player.play('playerDead')

      //this.player.scene.onPlayerDeath?.()
      return
    } else {
      this.recibiendoDano = true
      this.player.play('playerDamage')
    }
  }

  respawn() {
    playPlayerSoundEffect(this.player.scene, 'respawn')
    this.player.movement?.cancelDash()
    this.vida = this.maxVida
    this.player.setPosition(this.player.spawnX, this.player.spawnY)
    this.player.setVelocity(0, 0)
    this.player.setActive(true)
    this.player.setVisible(true)
    this.player.body.enable = true
    this.player.play('caminar', true)
    this.muerto = false
    this.recibiendoDano = false
    this.invulnerableHasta = 0
    this.player.ataque = false
  }
}
