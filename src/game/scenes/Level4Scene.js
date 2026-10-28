import EntityFactory from '../factories/EntityFactory.js'
import PlayerController from '../controllers/PlayerController.js'
import Key from '../entities/key.js'
import { LEVEL4_CONFIG } from '../configs/level4Config.js'
import BaseScene from './BaseScene.js'

export default class Level4Scene extends BaseScene {
  constructor(dependencies = {}) {
    super('Level4Scene', LEVEL4_CONFIG, dependencies)
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

    this.player.on('animationcomplete-atacar', () => {
      if (this.player.attack?.repetirAnimacionCargaCosa3()) return

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
    // El nivel 4 todavía no tiene enemigos.
    this.enemies = this.add.group()
  }

  _createBoxes() {
    // El nivel 4 todavía no tiene cajas ni llaves.
    this.boxes = this.add.group()
  }

  _getKeyClass() {
    return Key
  }
}
