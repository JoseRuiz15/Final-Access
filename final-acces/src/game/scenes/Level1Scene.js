import Phaser from 'phaser'
import EntityFactory from '../factories/EntityFactory.js'
import PhysicsService from '../services/PhysicsService.js'
import InputService from '../services/InputService.js'
import GameRepository from '../repositories/GameRepository.js'
import PlayerController from '../controllers/PlayerController.js'
import Key from '../entities/key.js'
import Animaciones from './Animaciones.js'
import Level1Assets from './level1/Level1Assets.js'
import Level1Parallax from './level1/Level1Parallax.js'
import Level1Map from './level1/Level1Map.js'
import Level1TutorialUI from './level1/Level1TutorialUI.js'
import Level1Collisions from './level1/Level1Collisions.js'
import Level1Interaction from './level1/Level1Interaction.js'

/** @implements {ISceneContract} */
export default class Level1Scene extends Phaser.Scene {

  constructor() {
    super('Level1Scene')
    this.recibiendoDano = false
    this.llaveCercana = null

    // Inyección de dependencias por constructor
    this.assets = new Level1Assets()
    this.parallax = new Level1Parallax()
    this.mapa = new Level1Map(this)
    this.tutorialUI = new Level1TutorialUI(this)
    this.collisions = new Level1Collisions(this)
    this.interaction = new Level1Interaction(this, this, this.mapa)
  }

  preload() {
    this.assets.preload(this)
  }

  create() {
    console.log('Nivel 1 iniciado')
    this.cameras.main.setZoom(0.8)

    // === INYECCION DE SERVICIOS (DIP) ===
    this.physicsService = new PhysicsService(this)
    this.inputService = new InputService(this)
    this.gameRepository = new GameRepository()

    // === COMPONENTES ===
    this.parallax.create(this)
    this.mapa.create()
    this.tutorialUI.create()
    this.interaction.init()

    // === SERVICIOS ADICIONALES ===
    this.scene.cameras.main.setBounds(0, 0, this.mapa.getMapWidth(), this.mapa.getMapHeight())
    this.physicsService.setBounds(this.mapa.getMapWidth(), this.mapa.getMapHeight())
    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height)

    this.proyectiles = this.physicsService.createGroup()

    // === CREACION DE ENTIDADES VIA FACTORY (OCP + DIP) ===
    this.player = EntityFactory.createPlayer(this, 230, 600, 'player', this.gameRepository)
    this.playerController = new PlayerController(this.player, this.inputService)

    this.registry.set("vidas", 5)

    this.player.on('animationcomplete-playerDie', () => {
      this.onPlayerDeath()
    })

    this.cameras.main.startFollow(this.player)

    this.player.on('animationcomplete-atacar', () => {
      console.log('Terminó ataque')
      this.player.ataque = false
      if (!this.player.muerto) {
        this.player.setTexture('player')
      }
    })

    this.player.on('animationcomplete-playerDamage', () => {
      if (!this.player.muerto && this.player.body.blocked.down) {
        this.player.setTexture('player')
      }
      this.player.recibiendoDano = false
      this.player.setTexture('player')
    })

    // === ANIMACIONES JUGADOR ===
    const animJugador = Animaciones.getJugador()
    this.anims.create({ key: 'caminar', frames: this.anims.generateFrameNumbers('playerWalk', { start: 0, end: 7 }), frameRate: animJugador.caminar.frameRate, repeat: animJugador.caminar.repeat })
    this.anims.create({ key: 'saltar', frames: this.anims.generateFrameNumbers('playerJump', { start: 0, end: 6 }), frameRate: animJugador.saltar.frameRate, repeat: animJugador.saltar.repeat })
    this.anims.create({ key: 'atacar', frames: this.anims.generateFrameNumbers('playerAttack', { start: 0, end: 12 }), frameRate: animJugador.atacar.frameRate, repeat: animJugador.atacar.repeat })
    this.anims.create({ key: 'playerDie', frames: this.anims.generateFrameNumbers('playerDead', { start: 0, end: 5 }), frameRate: animJugador.playerDie.frameRate, repeat: animJugador.playerDie.repeat })
    this.anims.create({ key: 'playerDamage', frames: this.anims.generateFrameNumbers('playerDamage', { start: 0, end: 5 }), frameRate: animJugador.playerDamage.frameRate, repeat: animJugador.playerDamage.repeat })

    // === ANIMACIONES ENEMIGO ===
    const animEnemigo = Animaciones.getEnemigo()
    this.anims.create({ key: 'enemyWalk', frames: this.anims.generateFrameNumbers('enemyWalk', { start: 0, end: 4 }), frameRate: animEnemigo.enemyWalk.frameRate, repeat: animEnemigo.enemyWalk.repeat })
    this.anims.create({ key: 'enemyAttack', frames: this.anims.generateFrameNumbers('enemy2Attack', { start: 0, end: 4 }), frameRate: animEnemigo.enemyAttack.frameRate, repeat: animEnemigo.enemyAttack.repeat })
    this.anims.create({ key: 'enemyDamage', frames: this.anims.generateFrameNumbers('enemyDamage', { start: 0, end: 4 }), frameRate: animEnemigo.enemyDamage.frameRate, repeat: animEnemigo.enemyDamage.repeat })
    this.anims.create({ key: 'explosion', frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 5 }), frameRate: 8, repeat: 0 })
    this.anims.create({ key: 'key2Spin', frames: this.anims.generateFrameNumbers('key2', { start: 0, end: 11 }), frameRate: 12, repeat: -1 })
    this.anims.create({ key: 'proyectile', frames: this.anims.generateFrameNumbers('proyectile', { start: 0, end: 5 }), frameRate: 10, repeat: -1 })

    // === ENEMIGOS VIA FACTORY (OCP) ===
    this.enemies = this.add.group()

    const enemy1 = EntityFactory.createEnemy(this, 700, 650, 'enemyWalk', { vida: 20, limiteIzquierdo: 670, limiteDerecho: 1100 }, this.gameRepository)
    const enemy2 = EntityFactory.createEnemy(this, 1100, 550, 'enemyWalk', { vida: 20, limiteIzquierdo: 670, limiteDerecho: 1100 }, this.gameRepository)
    const enemy3 = EntityFactory.createEnemy(this, 1500, 650, 'enemyWalk', { vida: 20, limiteIzquierdo: 1600, limiteDerecho: 2100 }, this.gameRepository)

    enemy1.target = this.player
    enemy2.target = this.player
    enemy3.target = this.player

    this.enemies.addMultiple([enemy1, enemy2, enemy3])

    this.enemies.getChildren().forEach((enemy) => {
      enemy.on('animationcomplete-enemyDamage', () => {
        enemy.recibiendoDano = false
        if (!enemy.muerto) {
          enemy.play('enemyWalk')
        }
      })
    })

    // === CAJAS VIA FACTORY (OCP) ===
    this.box1 = EntityFactory.createBox(this, 780, 435, { texture: 'key2', grupo: 'keys', color: 'silver', efecto: 'ninguno', correcta: true })
    this.box2 = EntityFactory.createBox(this, 812, 435)
    this.box3 = EntityFactory.createBox(this, 844, 435)
    this.box4 = EntityFactory.createBox(this, 812, 403)
    this.box5 = EntityFactory.createBox(this, 920, 660)
    this.boxes = [this.box1, this.box2, this.box3, this.box4, this.box5]

    // === INYECCION DE REFERENCIAS (DIP) ===
    this.player.enemies = this.enemies
    this.player.boxes = this.boxes

    // === LLAVES ===
    this.keys = this.physics.add.group({ classType: Key })

    // === COLISIONES VIA COMPONENTE ===
    this.collisions.setup(this.player, this.enemies, this.boxes, this.keys, this.mapa.getGroundLayer())

    // Configurar interacción
    this.interaction.init()
  }

  update() {
    // Parallax update
    const camX = this.cameras.main.scrollX
    this.parallax.update(this, camX)

    // Game over por caída
    if (this.player.active && this.player.y > 900) {
      this.player.recibirDano(9999)
    }

    // Input del jugador
    if (this.player && this.player.active) {
      this.playerController.handleInput()
    }

    // Enemigos
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        enemy.mover()
      }
    })

    // Interacción (llaves, puertas)
    this.interaction.update(this.inputService)
  }

  mostrarExplosion(x, y) {
    const explosion = this.add.sprite(x, y, 'explosion')
    explosion.play('explosion')
    explosion.once('animationcomplete-explosion', () => explosion.destroy())
  }

  onPlayerDeath() {
    this.player.body.enable = false
    this.time.delayedCall(100, () => {
      this.player.respawn()
    })
  }

  onEnemyDied() {
    console.log('Enemigo derrotado')
  }
}