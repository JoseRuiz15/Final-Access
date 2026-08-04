import Phaser from 'phaser'
import Player from '../objects/player.js'
import Enemy from '../objects/enemy.js'
import Box from '../objects/box.js'
import Key from '../objects/key.js'

class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene')
    this.recibiendoDaño = false
    this.llaveCercana = null
  }

  preload() {
    console.log(this.textures.get('playerJump').frameTotal)

    // FONDO PARALLAX
    this.load.image('parallax', '/img/parallax_background_layer_1.png')
    this.load.image('parallax2', '/img/parallax_background_layer_2.png')
    this.load.image('parallax3', '/img/parallax_background_layer_3.png')
    this.load.image('parallax4', '/img/parallax_background_layer_4.png')
    this.load.image('parallax5', '/img/parallax_background_layer_5.png')

    // MAPA Y TILESETS
    this.load.tilemapTiledJSON('level1', '/maps/Mapa_level_1.json')

    this.load.image('ground', '/tiles/ground.png')
    this.load.image('decorations', '/tiles/decorations.png')
    this.load.image('box', '/tiles/box.png')
    this.load.image('walls', '/tiles/walls.png')

    //CAJAS
    this.load.spritesheet('crateBreak', '/img/crateBreak.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    //LLAVES
    this.load.image('key1', '/img/keys/Key1-SILVER.png')

    this.load.image('imgRecogerLlave', '/img/imgRecogerLlave.png')

    this.load.spritesheet('key2', '/img/keys/Key2-SILVER.png', {
      frameWidth: 10,
      frameHeight: 28,
    })

    this.load.spritesheet('key6', '/img/keys/Key6-SILVER.png', {
      frameWidth: 16,
      frameHeight: 35,
    })

    // JUGADOR
    this.load.image('player', '/img/defaultCharacter.png')

    this.load.spritesheet('playerWalk', '/img/playerWalk.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    //hud

    this.load.spritesheet('playerJump', '/img/playerJump.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.spritesheet('playerAttack', '/img/playerAttack.png', {
      frameWidth: 48,
      frameHeight: 32,
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
  }

  create() {
    console.log('Nivel 1 iniciado')
    this.cameras.main.setZoom(0.8)

    // FONDO PARALLAX

    // Cada capa cubre exactamente el viewport. Se conserva el zoom de la
    // cámara, compensando su reducción solamente en el fondo.
    const fondoAncho = this.scale.width / this.cameras.main.zoom
    const fondoAlto = this.scale.height / this.cameras.main.zoom
    const fondoX = (this.scale.width - fondoAncho) / 2
    const fondoY = (this.scale.height - fondoAlto) / 2

    this.bg1 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax').setOrigin(0)
    this.bg2 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax2').setOrigin(0)
    this.bg3 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax3').setOrigin(0)
    this.bg4 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax4').setOrigin(0)
    this.bg5 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax5').setOrigin(0)
    this.bg5.setScale(1.2);

    this.bg5.y = fondoY + 150
    this.bg4.y = fondoY + 140
    this.bg3.y = fondoY + 80
    this.bg2.y = fondoY + 70

    // Mantenerlas fijas en la cámara
    this.bg1.setScrollFactor(0)
    this.bg2.setScrollFactor(0)
    this.bg3.setScrollFactor(0)
    this.bg4.setScrollFactor(0)
    this.bg5.setScrollFactor(0)

    // Orden de profundidad
    this.bg1.setDepth(-5)
    this.bg2.setDepth(-4)
    this.bg3.setDepth(-3)
    this.bg4.setDepth(-2)
    this.bg5.setDepth(-1)

    //creacion del mapa

    const map = this.make.tilemap({ key: 'level1' })
    const groundTiles = map.addTilesetImage('ground', 'ground')
    const decorationTiles = map.addTilesetImage('decorations', 'decorations')
    const boxTiles = map.addTilesetImage('box', 'box')
    const wallTiles = map.addTilesetImage('walls', 'walls')

    //creacion de capas del mapa

    map.createLayer('BackGround', [groundTiles, decorationTiles, boxTiles])

    const wallsLayer = map.createLayer('Walls', [groundTiles, decorationTiles, boxTiles, wallTiles])

    wallsLayer.setCollisionByExclusion([-1])

    map.createLayer('Door', [groundTiles, decorationTiles, boxTiles])

    const groundLayer = map.createLayer('Ground', [groundTiles, decorationTiles, boxTiles])

    groundLayer.setCollisionByExclusion([-1])

    // Camara y seguimiento del jugador
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height)

    this.proyectiles = this.physics.add.group()

    // ANIMACIONES DEL JUGADOR

    this.anims.create({
      key: 'caminar',

      frames: this.anims.generateFrameNumbers('playerWalk', {
        start: 0,
        end: 7,
      }),

      frameRate: 10,
      repeat: -1,
    })

    this.anims.create({
      key: 'saltar',

      frames: this.anims.generateFrameNumbers('playerJump', {
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

    this.player = new Player(this, 60, 400, 'player')

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

    //Animacion de las llaves
    this.anims.create({
      key: 'key2Spin',

      frames: this.anims.generateFrameNumbers('key2', {
        start: 0,
        end: 11,
      }),

      frameRate: 12,
      repeat: -1,
    })

    // ENEMIGO

    this.enemies = this.add.group()

    const enemy1 = new Enemy(this, 700, 550, 'enemyWalk')
    enemy1.vida = 20
    enemy1.limiteIzquierdo = 670
    enemy1.limiteDerecho = 1100

    const enemy2 = new Enemy(this, 1100, 550, 'enemyWalk')
    enemy2.vida = 20
    enemy2.limiteIzquierdo = 670
    enemy2.limiteDerecho = 1100

    const enemy3 = new Enemy(this, 1600, 300, 'enemyWalk')
    enemy3.vida = 20
    enemy3.limiteIzquierdo = 1600
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

    //CREACION DE LAS CAJAS
    this.box1 = new Box(this, 780, 435, {
      texture: 'key2',
      grupo: 'keys',
      color: 'silver',
      efecto: 'ninguno',
      correcta: true,
    })

    this.box2 = new Box(this, 812, 435)
    this.box3 = new Box(this, 844, 435)
    this.box4 = new Box(this, 812, 403)

    this.box5 = new Box(this, 920, 660)

    this.boxes = [this.box1, this.box2, this.box3, this.box4, this.box5]

    //LLAVES
    this.keys = this.physics.add.group({
      classType: Key,
    })

    //Tecla G para agarra las llaves
    this.teclaG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G)

    this.imgRecogerLlave = this.add.image(0, 0, 'imgRecogerLlave')
    this.imgRecogerLlave.setScale(0.25);
    this.imgRecogerLlave.setDepth(1000)
    this.imgRecogerLlave.setVisible(false)

    //Collision entre cajas
    for (let i = 0; i < this.boxes.length; i++) {
      for (let j = i + 1; j < this.boxes.length; j++) {
        this.physics.add.collider(this.boxes[i], this.boxes[j])
      }
    }

    //FISICAS DEL SUELO

    this.physics.add.collider(this.player, groundLayer)

    this.enemies.getChildren().forEach((enemy) => {
      this.physics.add.collider(enemy, groundLayer)
    })

    //Colision caja-suelo
    this.boxes.forEach((box) => {
      this.physics.add.collider(box, groundLayer)
    })
    //Colision jugador-cajas
    this.boxes.forEach((box) => {
      this.physics.add.collider(this.player, box)
    })

    this.physics.add.collider(this.keys, groundLayer)

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
    console.log(this.player.y)

    if (this.player && this.player.active) {
      this.player.mover()
    }

    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        enemy.mover()
      }
    })

    const camX = this.cameras.main.scrollX

    this.bg1.tilePositionX += (camX * 0.08 - this.bg1.tilePositionX) * 0.08
    this.bg2.tilePositionX += (camX * 0.15 - this.bg2.tilePositionX) * 0.08
    this.bg3.tilePositionX += (camX * 0.25 - this.bg3.tilePositionX) * 0.08
    this.bg4.tilePositionX += (camX * 0.4 - this.bg4.tilePositionX) * 0.08
    this.bg5.tilePositionX += (camX * 0.6 - this.bg5.tilePositionX) * 0.08

    this.llaveCercana = null

    this.keys.getChildren().forEach((llave) => {
      const distancia = Phaser.Math.Distance.Between(this.player.x, this.player.y, llave.x, llave.y)

      if (distancia < 80) {
        this.llaveCercana = llave
        console.log('Hay una llave cerca')
      }
    })
    if (this.llaveCercana) {
      this.imgRecogerLlave.setPosition(
        this.llaveCercana.x,
        this.llaveCercana.y - 40)

      this.imgRecogerLlave.setVisible(true)
    } else {
      this.imgRecogerLlave.setVisible(false)
    }

    if (Phaser.Input.Keyboard.JustDown(this.teclaG) && this.llaveCercana) {
      this.player.recogerLlave(this.llaveCercana)
      this.llaveCercana = null
    }
  }
}

export default Level1Scene
