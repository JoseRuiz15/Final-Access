import EntityFactory from '../factories/EntityFactory.js'
import EnemyTrap from '../entities/enemyTrap.js'
import PlayerController from '../controllers/PlayerController.js'
import Key from '../entities/key.js'
import { LEVEL3_CONFIG } from '../configs/level3Config.js'
import BaseScene from './BaseScene.js'

export default class Level3Scene extends BaseScene {
  constructor(dependencies = {}) {
    super('Level3Scene', LEVEL3_CONFIG, dependencies)
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
    })

    this._createEnemyTraps()
  }

  _createEnemyTraps() {
    const attackAnimation = 'enemyTrapAttack'
    if (!this.anims.exists(attackAnimation)) {
      this.anims.create({
        key: attackAnimation,
        frames: this.anims.generateFrameNumbers('enemyTrapAnimation', { start: 0, end: 8 }),
        frameRate: 12,
        repeat: 0,
      })
    }

    this.traps = this.add.group()
    this.config.enemyTraps?.forEach((config) => {
      const trap = new EnemyTrap(this, config.x, config.y, config)
      trap.target = this.player
      this.traps.add(trap)
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

  update() {
    super.update()

    this.traps?.getChildren().forEach((trap) => {
      if (trap.active) trap.update()
    })
  }
}
