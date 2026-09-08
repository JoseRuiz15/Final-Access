import Phaser from 'phaser'
import Player from '../entities/player'
import Enemy from '../entities/enemy'
import Box from '../entities/box'

class Level2Scene extends Phaser.Scene {
    constructor() {
        super('Level2Scene')
         this.recibiendoDaño = false
         this.llaveCercana = null
    }

    preload() {

      //Fondo del juego PARALLAX
      this.load.image('parallax2', '/img/layer2.png')
      this.load.image('parallax3', '/img/layer3.png')
      this.load.image('parallax4', '/img/layer4.png')
      this.load.image('parallax5', '/img/layer5.png')

      //Mapa
      this.load.tilemapTiledJSON('level2', '/maps/Mapa_level_2.json')
      //Tilesets
      this.load.image('ground', '/tiles/ground.png')
      this.load.image('groundBack', '/tiles/groundBack.png')
      this.load.image('pinchos','/tiles/pinchos.png')

      //PLAYER
      this.load.image('player', '/img/defaultCharacter.png')
      //Animaciones del player
      this.load.spritesheet('playerWalk', '/img/playerWalk.png', {
          frameWidth: 32,
          frameHeight: 32
      })
      this.load.spritesheet('playerJump', '/img/playerJump.png',{
          frameWidth: 32,
          frameHeight: 32
      })
      this.load.spritesheet('playerAttack','/img/playerAttack.png', {
        frameWidth: 48,
        frameHeight: 32
      })
      this.load.spritesheet('playerDamage', '/img/playerDamage.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.spritesheet('playerDead', '/img/playerDead.png', {
      frameWidth: 64,
      frameHeight: 32,
    })

       // ENEMIGO
    this.load.spritesheet('enemyWalk', '/img/enemyWalk.png', {
      frameWidth: 48,
      frameHeight: 32,
    })

    this.load.spritesheet('enemy2Attack', '/img/enemyAttack.png', {
      frameWidth: 48,
      frameHeight: 32,
    })

    this.load.spritesheet('explosion', '/img/explosion.png', {
      frameWidth: 48,
      frameHeight: 32,
    })

    this.load.spritesheet('enemyDamage', '/img/enemyDamage.png', {
      frameWidth: 48,
      frameHeight: 32,
    })

    this.load.spritesheet('proyectile', '/img/enemy2attackeffect.png', {
      frameWidth: 48,
      frameHeight: 32,
    })



    //Final del Preload
    }

    create() {
    //Zoom de la camara general de juego
    this.cameras.main.setZoom(0.8)

    // FONDO PARALLAX
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



  // MAPA
    const map = this.make.tilemap({ key: 'level2' })

    // Conectamos el tileset de Tiled con la imagen cargada en Phaser
    const groundTiles = map.addTilesetImage('ground', 'ground')
    const groundBackTiles = map.addTilesetImage('groundBack', 'groundBack')
    const pinchosTiles = map.addTilesetImage('pinchos', 'pinchos')

    // CAPAS DE OBJETOS
    this.doors = map.getObjectLayer('DoorObject')
    this.pinchosDanger = map.getObjectLayer('PinchosDanger')

    // CAPAS VISUALES DEL MAPA
    const groundLayer = map.createLayer('Ground', [groundTiles, groundBackTiles, pinchosTiles])
    const pinchosLayer = map.createLayer('Pinchos', [pinchosTiles])
    const marcoPuertaLayer = map.createLayer('MarcoPuerta', [groundTiles])

    // COLISIÓN DEL SUELO
    groundLayer.setCollisionByExclusion([-1])

    // Límites del mundo
    this.cameras.main.setBounds(
        0,
        0,
        map.widthInPixels,
        map.heightInPixels
    )

    this.physics.world.setBounds(
        0,
        0,
        map.widthInPixels,
        map.heightInPixels
    )

    //CREAR PLAYER
    this.player = new Player(this, 230, 600, 'player')
    //vida del jugador
    this.registry.set("vidas", 5);
    //muerte del jugador
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

    //Animaciones Jugador
    this.anims.create({
      key: 'caminar',
      frames: this.anims.generateFrameNumbers ('playerWalk',{
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'saltar',
      frames: this.anims.generateFrameNumbers('playerJump',{
        start: 0,
        end: 6,
      }),
      frameRate: 3,
      repeat: 0,
    })

    this.anims.create({
      key: 'atacar',
      frames: this.anims.generateFrameNumbers('playerAttack', {
        start: 0,
        end: 12,
      }),
      frameRate: 18,
      repeat: 0,
    })

    this.anims.create({
      key: 'playerDie',

      frames: this.anims.generateFrameNumbers('playerDead', {
        start: 0,
        end: 5,
      }),

      frameRate: 12,
      repeat: 0,
    })

    this.anims.create({
      key: 'playerDamage',

      frames: this.anims.generateFrameNumbers('playerDamage', {
        start: 0,
        end: 5,
      }),

      frameRate: 12,
      repeat: 0,
    })
    //ANIMACIONES DEL ENEMIGO

    this.anims.create({
      key: 'enemyWalk',
      frames: this.anims.generateFrameNumbers('enemyWalk', {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    })

    //animacion de ataque

    this.anims.create({
      key: 'enemyAttack',
      frames: this.anims.generateFrameNumbers('enemy2Attack', {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'enemyDamage',

      frames: this.anims.generateFrameNumbers('enemyDamage', {
        start: 0,
        end: 4,
      }),

      frameRate: 12,
      repeat: 0,
    })

    this.anims.create({
      key: 'explosion',

      frames: this.anims.generateFrameNumbers('explosion', {
        start: 0,
        end: 5,
      }),

      frameRate: 8,

      repeat: 0,
    })

    this.enemies = this.add.group()

    const enemy1 = new Enemy(this, 400, 650, 'enemyWalk')
    enemy1.vida = 20
    enemy1.limiteIzquierdo = 370
    enemy1.limiteDerecho = 600

    const enemy2 = new Enemy(this, 1250, 650, 'enemyWalk')
    enemy2.vida = 20
    enemy2.limiteIzquierdo = 600
    enemy2.limiteDerecho = 1300

    const enemy3 = new Enemy(this, 2000, 650, 'enemyWalk')
    enemy3.vida = 20
    enemy3.limiteIzquierdo = 1900
    enemy3.limiteDerecho = 2100

    this.enemies.addMultiple([enemy1, enemy2, enemy3])

    this.enemies.getChildren().forEach((enemy) => {
      enemy.on('animationcomplete-enemyDamage', () => {
        enemy.recibiendoDaño = false

        if (!enemy.muerto) {
          enemy.play('enemyWalk')
        }
      })
    })

    //Colision del player con el piso
    this.physics.add.collider(this.player, groundLayer)

    this.enemies.getChildren().forEach((enemy) => {
      this.physics.add.collider(enemy, groundLayer)
    })
    //Movimiento de camara para el jugador
    this.cameras.main.startFollow(this.player)

    this.player.on('animationcomplete-atacar', () => {
      console.log('Terminó ataque')

      this.player.ataque = false

      if (!this.player.muerto) {
        this.player.setTexture('player')
      }
    })

    //aniamcion del proyectil
    this.anims.create({
      key: 'proyectile',
      frames: this.anims.generateFrameNumbers('proyectile', {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    })
    this.physics.add.overlap(this.player, this.proyectiles, (player, proyectil) => {
      player.recibirDaño(20)
      proyectil.destroy()
    })
    

    //Final del create
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

    //Movimiento del fondo Parallax
    const camX = this.cameras.main.scrollX

    this.bg2.tilePositionX += (camX * 0.15 - this.bg2.tilePositionX) * 0.08
    this.bg3.tilePositionX += (camX * 0.25 - this.bg3.tilePositionX) * 0.08
    this.bg4.tilePositionX += (camX * 0.4 - this.bg4.tilePositionX) * 0.08
    this.bg5.tilePositionX += (camX * 0.6 - this.bg5.tilePositionX) * 0.08

    //Movimiento del player
    this.player.mover()

    }
}

export default Level2Scene
