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
    this.player = EntityFactory.createPlayer(
      this,
      x,
      y,
      this.characterConfig?.texture ?? 'player',
      this.gameRepository,
    )
    this.playerController = new PlayerController(this.player, this.inputService)

    this.cameras.main.startFollow(this.player)

    //this.player.on('animationcomplete-playerDie', () => this.onPlayerDeath())

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

    this.config.boxes.forEach(({ x, y, keyData }) => {
      const box = EntityFactory.createBox(this, x, y, keyData)
      this.boxes.add(box)
    })
  }

  _getKeyClass() {
    return Key
  }
}
