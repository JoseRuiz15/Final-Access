import EntityFactory from '../factories/EntityFactory.js'
import PlayerController from '../controllers/PlayerController.js'
import Key from '../entities/key.js'
import { LEVEL2_CONFIG } from '../configs/level2Config.js'
import BaseScene from './BaseScene.js'

export default class Level2Scene extends BaseScene {
  constructor(dependencies = {}) {
    super('Level2Scene', LEVEL2_CONFIG, dependencies)
  }

  _createPlayer() {
    const { x, y } = this.config.player
    this.player = EntityFactory.createPlayer(this, x, y, 'player', this.gameRepository)
    this.playerController = new PlayerController(this.player, this.inputService)

    this.registry.set('vidas', 5)
    this.cameras.main.startFollow(this.player)

    this.player.on('animationcomplete-playerDie', () => this.onPlayerDeath())

    this.player.on('animationcomplete-atacar', () => {
      this.player.ataque = false
      if (!this.player.muerto) this.player.setTexture('player')
    })

    this.player.on('animationcomplete-playerDamage', () => {
      if (!this.player.muerto && this.player.body.blocked.down) this.player.setTexture('player')
      this.player.recibiendoDano = false
      this.player.setTexture('player')
    })
  }

  _createEnemies() {
    this.enemies = this.add.group()

    this.config.enemies.forEach((config) => {
      const enemy = EntityFactory.createEnemy(
        this,
        config.x,
        config.y,
        config.texture,
        config,
        this.gameRepository,
      )
      enemy.target = this.player
      this.enemies.add(enemy)

      enemy.on('animationcomplete-enemyDamage', () => {
        enemy.recibiendoDano = false
        if (!enemy.muerto) enemy.play('enemyWalk')
      })
    })
  }

  _createBoxes() {
    this.boxes = this.add.group()
  }

  _getKeyClass() {
    return Key
  }
}
