import Phaser from 'phaser'
import Player from '../objects/player'
import Enemy from '../objects/enemy'
import Box from '../objects/box'

class Level2Scene extends Phaser.Scene {
    constructor() {
        super('Level2Scene')
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
      this.load.spritesheet('playerAttack.png','/img/playerAttack.png', {
        frameWidth: 32,
        frameHeight: 32
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

    //Colision del player con el piso
    this.physics.add.collider(this.player, groundLayer)
    //Movimiento de camara para el jugador
    this.cameras.main.startFollow(this.player)

    //Final del create
    }

    update() {

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
