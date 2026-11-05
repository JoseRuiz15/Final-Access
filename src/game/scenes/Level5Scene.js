import EntityFactory from '../factories/EntityFactory.js'
import PlayerController from '../controllers/PlayerController.js'
import Key from '../entities/key.js'
import EnemyTrap from '../entities/enemyTrap.js'
import { LEVEL5_CONFIG } from '../configs/level5Config.js'
import BaseScene from './BaseScene.js'

export default class Level5Scene extends BaseScene {
  constructor(dependencies = {}) {
    super('Level5Scene', LEVEL5_CONFIG, dependencies)
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

    // Checkpoint state
    this._checkpointActivado = false

    this.cameras.main.startFollow(this.player)

    this.player.on('animationcomplete-atacar', () => {
      if (this.player.attack?.repetirAnimacionCargaCosa3()) return

      this.player.ataque = false
      if (!this.player.muerto) this.player.setTexture(this.player.idleTexture)
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
    const trapAnimKey = 'enemyTrapAnimation'

    // Verificar si la animación ya fue creada (para evitar error "already in use")
    if (!this.anims.exists(attackAnimation) && this.textures.exists(trapAnimKey)) {
      this.anims.create({
        key: attackAnimation,
        frames: this.anims.generateFrameNumbers(trapAnimKey, { start: 0, end: 8 }),
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

    // Checkpoint en X:1530 - guarda posición actual del jugador al cruzarla
    const cpX = this.config.checkpointX
    if (cpX && !this._checkpointActivado && this.player?.active && this.player.x >= cpX) {
      this.player.spawnX = this.player.x
      this.player.spawnY = this.player.y
      this._checkpointActivado = true
      console.log('✅ Checkpoint activado en', this.player.x, this.player.y)
    }

    this.traps?.getChildren().forEach((trap) => {
      if (trap.active) trap.update()
    })
  }
}
