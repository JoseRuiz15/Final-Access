import Phaser from 'phaser'
import EntityFactory from '../factories/EntityFactory.js'
import PhysicsService from '../services/PhysicsService.js'
import InputService from '../services/InputService.js'
import GameRepository from '../repositories/GameRepository.js'
import PlayerController from '../controllers/PlayerController.js'
import Key from '../entities/key.js'
import AssetLoader from '../builders/AssetLoader.js'
import ParallaxBuilder from '../builders/ParallaxBuilder.js'
import MapBuilder from '../builders/MapBuilder.js'
import TutorialUI from '../builders/TutorialUI.js'
import CollisionSetup from '../builders/CollisionSetup.js'
import AnimationRegistry from '../builders/AnimationRegistry.js'
import InteractionManager from '../builders/InteractionManager.js'
import { LEVEL1_CONFIG } from '../configs/level1Config.js'

/** @implements {ISceneContract} */
export default class Level1Scene extends Phaser.Scene {

  constructor() {
    super('Level1Scene')
  }

  preload() {
    AssetLoader.load(this, LEVEL1_CONFIG.assets)
  }

  create() {
    this.cameras.main.setZoom(0.8)

    this.physicsService = new PhysicsService(this)
    this.inputService = new InputService(this)
    this.gameRepository = new GameRepository()

    AnimationRegistry.registerAll(this)

    this.parallax = ParallaxBuilder.create(this, LEVEL1_CONFIG.parallax)

    const mapResult = MapBuilder.create(this, LEVEL1_CONFIG.map, this.physicsService)
    this.mapResult = mapResult

    this.tutorialElements = TutorialUI.create(this, LEVEL1_CONFIG.tutorial)

    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height)

    this.proyectiles = this.physicsService.createGroup()

    const { player, controller } = this._createPlayer()
    this.player = player
    this.playerController = controller

    this.enemies = this._createEnemies()
    this.boxes = this._createBoxes()

    this.keys = this.physics.add.group({ classType: Key })

    this.player.enemies = this.enemies
    this.player.boxes = this.boxes

    const doors = mapResult.objectLayers['DoorObjet']
    const doorSprite = this.add.image(
      doors.objects[0].x + 32, doors.objects[0].y + 32, 'redDoor'
    ).setDepth(10)

    CollisionSetup.setup(this.physicsService, {
      player: this.player,
      enemies: this.enemies,
      boxes: this.boxes,
      keys: this.keys,
      groundLayer: mapResult.layers['Ground'],
      proyectiles: this.proyectiles,
    })

    InteractionManager.create(this, {
      player: this.player,
      doors,
      doorSprite,
      keysGroup: this.keys,
    })
  }

  _createPlayer() {
    const { x, y } = LEVEL1_CONFIG.player
    const player = EntityFactory.createPlayer(this, x, y, 'player', this.gameRepository)
    const controller = new PlayerController(player, this.inputService)

    this.registry.set('vidas', 5)
    this.cameras.main.startFollow(player)

    player.on('animationcomplete-playerDie', () => this.onPlayerDeath())

    player.on('animationcomplete-atacar', () => {
      player.ataque = false
      if (!player.muerto) player.setTexture('player')
    })

    player.on('animationcomplete-playerDamage', () => {
      if (!player.muerto && player.body.blocked.down) player.setTexture('player')
      player.recibiendoDano = false
      player.setTexture('player')
    })

    return { player, controller }
  }

  _createEnemies() {
    const group = this.add.group()

    LEVEL1_CONFIG.enemies.forEach((config) => {
      const enemy = EntityFactory.createEnemy(
        this, config.x, config.y, config.texture, config, this.gameRepository
      )
      enemy.target = this.player
      group.add(enemy)

      enemy.on('animationcomplete-enemyDamage', () => {
        enemy.recibiendoDano = false
        if (!enemy.muerto) enemy.play('enemyWalk')
      })
    })

    return group
  }

  _createBoxes() {
    return LEVEL1_CONFIG.boxes.map((config) =>
      EntityFactory.createBox(this, config.x, config.y, config.keyData)
    )
  }

  update() {
    ParallaxBuilder.update(this.parallax, this.cameras.main.scrollX)

    if (this.player.active && this.player.y > 900) {
      this.player.recibirDano(9999)
    }

    if (this.player && this.player.active) {
      this.playerController.handleInput()
    }

    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) enemy.mover()
    })

    InteractionManager.update(this, this.inputService)
  }

  mostrarExplosion(x, y) {
    const explosion = this.add.sprite(x, y, 'explosion')
    explosion.play('explosion')
    explosion.once('animationcomplete-explosion', () => explosion.destroy())
  }

  onPlayerDeath() {
    this.player.body.enable = false
    this.time.delayedCall(100, () => this.player.respawn())
  }

  onEnemyDied() {
    console.log('Enemigo derrotado')
  }
}
