import Phaser from 'phaser'
import ParallaxBuilder from '../builders/ParallaxBuilder.js'

export default class BaseScene extends Phaser.Scene {
  constructor(key, config, dependencies = {}) {
    super(key)
    this.config = config

    // Dependencias inyectadas
    this.physicsService = dependencies.physicsService
    this.inputService = dependencies.inputService
    this.gameRepository = dependencies.gameRepository
    this.animationRegistry = dependencies.animationRegistry
    this.assetLoader = dependencies.assetLoader
    this.parallaxBuilder = dependencies.parallaxBuilder || ParallaxBuilder
    this.mapBuilder = dependencies.mapBuilder
    this.tutorialUI = dependencies.tutorialUI
    this.collisionSetup = dependencies.collisionSetup
    this.doorManager = dependencies.doorManager
    this.keyManager = dependencies.keyManager
    this.explosionManager = dependencies.explosionManager

    // Estado común
    this.player = null
    this.playerController = null
    this.enemies = null
    this.boxes = []
    this.keys = null
    this.proyectiles = null
    this.parallax = null
    this.mapResult = null
    this.tutorialElements = null
    this.doorSprite = null
  }

  preload() {
    if (this.assetLoader && this.config.assets) {
      this.assetLoader.load(this, this.config.assets)
    }
  }

  create() {
    console.log(`${this.scene.key} iniciado`)
    this.cameras.main.setZoom(this.config.zoom || 0.8)

    // === INICIALIZAR SERVICIOS LAZY (reciben scene aquí) ===
    this.physicsService?.init(this)
    this.inputService?.init(this)
    this.keyManager?.init(this)
    this.doorManager?.init(this)
    this.explosionManager?.init(this)

    // Servicios ya inyectados, solo configurar bounds si es necesario
    if (this.config.physics) {
      this.physicsService.setBounds(
        this.config.physics.worldWidth || this.scale.width,
        this.config.physics.worldHeight || this.scale.height,
      )
    }

    // === ANIMACIONES ===
    if (this.animationRegistry) {
      this.animationRegistry.registerAll(this)
    }

    // === PARALLAX ===
    if (this.parallaxBuilder && this.config.parallax) {
      this.parallax = this.parallaxBuilder.create(
        this,
        this.config.parallax,
        this.config.zoom || 0.8,
      )
    }

    // === MAPA ===
    if (this.mapBuilder && this.config.map) {
      this.mapResult = this.mapBuilder.create(this, this.config.map, this.physicsService)
    }

    // === TUTORIAL UI ===
    if (this.tutorialUI && this.config.tutorial) {
      this.tutorialElements = this.tutorialUI.create(this, this.config.tutorial)
    }

    // === CÁMARA Y FÍSICA ===
    if (this.mapResult) {
      this.cameras.main.setBounds(
        0,
        0,
        this.mapResult.map.widthInPixels,
        this.mapResult.map.heightInPixels,
      )
      this.physicsService.setBounds(
        this.mapResult.map.widthInPixels,
        this.mapResult.map.heightInPixels,
      )
    }
    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height)

    // === GRUPO PROYECTILES ===
    this.proyectiles = this.physicsService.createGroup()

    // === ENTIDADES ===
    this._createPlayer()
    this._createEnemies()
    this._createBoxes()

    // === LLAVES ===
    this.keyManager?.create(this._getKeyClass())

    // === INYECCIÓN DE REFERENCIAS (DIP) ===
    this.player.enemies = this.enemies
    this.player.boxes = this.boxes

    // === COLISIONES ===
    if (this.collisionSetup && this.mapResult) {
      this.collisionSetup.setup(
        this.physicsService,
        {
          player: this.player,
          enemies: this.enemies,
          boxes: this.boxes,
          keys: this.keyManager?.getKeysGroup(),
          groundLayer: this.mapResult.layers['Ground'],
          proyectiles: this.proyectiles,
        },
        this.config,
      )
    }

    // === MANAGERS ===
    this.doorManager?.create(this.mapResult)
    this.doorSprite = this.doorManager?.getDoorSprite()

    // === LLAVES (grupo para colisiones) ===
    this.keys = this.keyManager?.getKeysGroup()

    // === COLISIONES DE LLAVES CON SUELO ===
    if (this.keyManager?.getKeysGroup() && this.mapResult?.layers?.Ground) {
      this.physicsService.addCollider(this.keyManager.getKeysGroup(), this.mapResult.layers.Ground)
    }
  }

  // Métodos a implementar por subclases
  _createPlayer() {
    throw new Error('_createPlayer() must be implemented by subclass')
  }

  _createEnemies() {
    throw new Error('_createEnemies() must be implemented by subclass')
  }

  _createBoxes() {
    throw new Error('_createBoxes() must be implemented by subclass')
  }

  _getKeyClass() {
    throw new Error('_getKeyClass() must be implemented by subclass')
  }

  update() {
    // Parallax update
    if (this.parallax) {
      ParallaxBuilder.update(this.parallax, this.cameras.main.scrollX)
    }

    // Game over por caída
    if (this.player?.active && this.player.y > 900) {
      this.player.recibirDano(9999)
    }

    // Input del jugador
    if (this.player?.active) {
      this.playerController?.handleInput()
    }

    // Enemigos
    if (this.enemies) {
      this.enemies.getChildren().forEach((enemy) => {
        if (enemy.active) enemy.update()
      })
    }

    // Managers update
    this.keyManager?.update(this.player, this.inputService)
    this.doorManager?.checkProximity(this.player, this.inputService)
  }

  mostrarExplosion(x, y) {
    if (!this.explosionManager?.create(x, y)) {
      this._defaultExplosion(x, y)
    }
  }

  _defaultExplosion(x, y) {
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
