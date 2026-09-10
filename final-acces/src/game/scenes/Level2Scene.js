import Phaser from 'phaser'
import EntityFactory from '../factories/EntityFactory.js'
import PhysicsService from '../services/PhysicsService.js'
import InputService from '../services/InputService.js'
import GameRepository from '../repositories/GameRepository.js'

export default class Level2Scene extends Phaser.Scene {

    constructor() {
        super('Level2Scene')
        this.recibiendoDaño = false
        this.llaveCercana = null
    }

    preload() {

      //Fondo del juego PARALLAX
      this.load.image('parallax2', '/img/maps/layer2-mapa2.png')
      this.load.image('parallax3', '/img/maps/layer3-mapa2.png')
      this.load.image('parallax4', '/img/maps/layer4-mapa2.png')
      this.load.image('parallax5', '/img/maps/layer5-mapa2.png')

        this.load.tilemapTiledJSON('level2', '/maps/Mapa_level_2.json')
        this.load.image('ground', '/tiles/ground.png')
        this.load.image('groundBack', '/tiles/groundBack.png')
        this.load.image('pinchos', '/tiles/pinchos.png')

        this.load.image('player', '/img/character/defaultCharacter.png')
        this.load.spritesheet('playerWalk', '/img/animatics-player/playerWalk.png', { frameWidth: 32, frameHeight: 32 })
        this.load.spritesheet('playerJump', '/img/animatics-player/playerJump.png', { frameWidth: 32, frameHeight: 32 })
        this.load.spritesheet('playerAttack', '/img/animatics-player/playerAttack.png', { frameWidth: 48, frameHeight: 32 })
        this.load.spritesheet('playerDamage', '/img/animatics-player/playerDamage.png', { frameWidth: 32, frameHeight: 32 })
        this.load.spritesheet('playerDead', '/img/animatics-player/playerDead.png', { frameWidth: 64, frameHeight: 32 })

        this.load.spritesheet('enemyWalk', '/img/animatics-enemy/enemyWalk.png', { frameWidth: 48, frameHeight: 32 })
        this.load.spritesheet('enemy2Attack', '/img/animatics-enemy/enemyAttack.png', { frameWidth: 48, frameHeight: 32 })
        this.load.spritesheet('explosion', '/img/animatics-enemy/explosion.png', { frameWidth: 48, frameHeight: 32 })
        this.load.spritesheet('enemyDamage', '/img/animatics-enemy/enemyDamage.png', { frameWidth: 48, frameHeight: 32 })
        this.load.spritesheet('proyectile', '/img/animatics-enemy/enemy2attackeffect.png', { frameWidth: 48, frameHeight: 32 })
    }

    create() {
        this.cameras.main.setZoom(0.8)

        // === INYECCION DE SERVICIOS (DIP) ===
        this.physicsService = new PhysicsService(this)
        this.inputService = new InputService(this)
        this.gameRepository = new GameRepository()

        // === FONDO PARALLAX ===
        const fondoAncho = this.scale.width / this.cameras.main.zoom
        const fondoAlto = this.scale.height / this.cameras.main.zoom
        const fondoX = (this.scale.width - fondoAncho) / 2
        const fondoY = (this.scale.height - fondoAlto) / 2

        this.bg2 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax2').setOrigin(0)
        this.bg3 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax3').setOrigin(0)
        this.bg4 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax4').setOrigin(0)
        this.bg5 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax5').setOrigin(0)

        this.bg2.setScrollFactor(0)
        this.bg3.setScrollFactor(0)
        this.bg4.setScrollFactor(0)
        this.bg5.setScrollFactor(0)
        this.bg2.y = fondoY - 80
        this.bg4.y = fondoY + 50

        // === MAPA ===
        const map = this.make.tilemap({ key: 'level2' })
        const groundTiles = map.addTilesetImage('ground', 'ground')
        const groundBackTiles = map.addTilesetImage('groundBack', 'groundBack')
        const pinchosTiles = map.addTilesetImage('pinchos', 'pinchos')

        this.doors = map.getObjectLayer('DoorObject')
        this.pinchosDanger = map.getObjectLayer('PinchosDanger')

        const groundLayer = map.createLayer('Ground', [groundTiles, groundBackTiles, pinchosTiles])
        const _pinchosLayer = map.createLayer('Pinchos', [pinchosTiles])
        const _marcoPuertaLayer = map.createLayer('MarcoPuerta', [groundTiles])

        groundLayer.setCollisionByExclusion([-1])

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.physicsService.setBounds(map.widthInPixels, map.heightInPixels)

        // === PLAYER VIA FACTORY (OCP) ===
        this.player = EntityFactory.createPlayer(this, 230, 600, 'player')
        this.registry.set("vidas", 5)

        this.player.on('animationcomplete-playerDie', () => {
            this.player.body.enable = false
            this.time.delayedCall(100, () => {
                this.player.respawn()
            })
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
            this.player.recibiendoDaño = false
            this.player.setTexture('player')
        })

        // === ANIMACIONES ===
        this.anims.create({ key: 'caminar', frames: this.anims.generateFrameNumbers('playerWalk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 })
        this.anims.create({ key: 'saltar', frames: this.anims.generateFrameNumbers('playerJump', { start: 0, end: 6 }), frameRate: 3, repeat: 0 })
        this.anims.create({ key: 'atacar', frames: this.anims.generateFrameNumbers('playerAttack', { start: 0, end: 12 }), frameRate: 18, repeat: 0 })
        this.anims.create({ key: 'playerDie', frames: this.anims.generateFrameNumbers('playerDead', { start: 0, end: 5 }), frameRate: 12, repeat: 0 })
        this.anims.create({ key: 'playerDamage', frames: this.anims.generateFrameNumbers('playerDamage', { start: 0, end: 5 }), frameRate: 12, repeat: 0 })
        this.anims.create({ key: 'enemyWalk', frames: this.anims.generateFrameNumbers('enemyWalk', { start: 0, end: 4 }), frameRate: 10, repeat: -1 })
        this.anims.create({ key: 'enemyAttack', frames: this.anims.generateFrameNumbers('enemy2Attack', { start: 0, end: 4 }), frameRate: 10, repeat: -1 })
        this.anims.create({ key: 'enemyDamage', frames: this.anims.generateFrameNumbers('enemyDamage', { start: 0, end: 4 }), frameRate: 12, repeat: 0 })
        this.anims.create({ key: 'explosion', frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 5 }), frameRate: 8, repeat: 0 })
        this.anims.create({ key: 'proyectile', frames: this.anims.generateFrameNumbers('proyectile', { start: 0, end: 5 }), frameRate: 10, repeat: -1 })

        // === ENEMIGOS VIA FACTORY (OCP) ===
        this.enemies = this.add.group()

        const enemy1 = EntityFactory.createEnemy(this, 400, 650, 'enemyWalk', { vida: 20, limiteIzquierdo: 370, limiteDerecho: 600 })
        const enemy2 = EntityFactory.createEnemy(this, 1250, 650, 'enemyWalk', { vida: 20, limiteIzquierdo: 600, limiteDerecho: 1300 })
        const enemy3 = EntityFactory.createEnemy(this, 2000, 650, 'enemyWalk', { vida: 20, limiteIzquierdo: 1900, limiteDerecho: 2100 })

        this.enemies.addMultiple([enemy1, enemy2, enemy3])

        this.enemies.getChildren().forEach((enemy) => {
            enemy.on('animationcomplete-enemyDamage', () => {
                enemy.recibiendoDaño = false
                if (!enemy.muerto) {
                    enemy.play('enemyWalk')
                }
            })
        })

        // === COLISIONES VIA PHYSICSSERVICE (DIP) ===
        this.proyectiles = this.physicsService.createGroup()

        this.physicsService.addCollider(this.player, groundLayer)

        this.enemies.getChildren().forEach((enemy) => {
            this.physicsService.addCollider(enemy, groundLayer)
        })

        this.physicsService.addOverlap(this.player, this.proyectiles, (player, proyectil) => {
            player.recibirDaño(20)
            proyectil.destroy()
        })
    }

    mostrarExplosion(x, y) {
        const explosion = this.add.sprite(x, y, 'explosion')
        explosion.play('explosion')
        explosion.once('animationcomplete-explosion', () => explosion.destroy())
    }

    update() {
        if (this.player.active && this.player.y > 900) {
            this.player.recibirDaño(9999)
        }

        this.enemies.getChildren().forEach((enemy) => {
            if (enemy.active) {
                enemy.mover()
            }
        })

        const camX = this.cameras.main.scrollX
        this.bg2.tilePositionX += (camX * 0.15 - this.bg2.tilePositionX) * 0.08
        this.bg3.tilePositionX += (camX * 0.25 - this.bg3.tilePositionX) * 0.08
        this.bg4.tilePositionX += (camX * 0.4 - this.bg4.tilePositionX) * 0.08
        this.bg5.tilePositionX += (camX * 0.6 - this.bg5.tilePositionX) * 0.08

        this.player.mover()
    }
}
