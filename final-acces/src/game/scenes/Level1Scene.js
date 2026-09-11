import Phaser from 'phaser'
import EntityFactory from '../factories/EntityFactory.js'
import PhysicsService from '../services/PhysicsService.js'
import InputService from '../services/InputService.js'
import GameRepository from '../repositories/GameRepository.js'
import PlayerController from '../controllers/PlayerController.js'
import Key from '../entities/key.js'

/** @implements {ISceneContract} */
export default class Level1Scene extends Phaser.Scene {

  constructor() {
    super('Level1Scene')
    this.recibiendoDano = false
    this.llaveCercana = null
  }

  preload() {
    console.log(this.textures.get('playerJump').frameTotal)

    // FONDO PARALLAX
    this.load.image('parallax', '/img/maps/layer1-map1.png')
    this.load.image('parallax2', '/img/maps/layer2-map1.png')
    this.load.image('parallax3', '/img/maps/layer3-map1.png')
    this.load.image('parallax4', '/img/maps/layer4-map1.png')
    this.load.image('parallax5', '/img/maps/layer5-map1.png')

    // MAPA Y TILESETS
    this.load.tilemapTiledJSON('level1', '/maps/Mapa_level_1.json')
    this.load.image('ground', '/tiles/ground.png')
    this.load.image('decorations', '/tiles/decorations.png')
    this.load.image('box', '/tiles/box.png')
    this.load.image('walls', '/tiles/walls.png')

    // TUTORIAL
    this.load.image('imgSaltar', '/img/instruction/imgSaltar.png')
    this.load.image('imgDerecha', '/img/instruction/imgDerecha.png')
    this.load.image('imgIzquierda', '/img/instruction/imgIzquierda.png')
    this.load.image('imgAtacar', '/img/instruction/imgAtacar.png')
    this.load.image('imgInsertarLlave', '/img/instruction/imgInsertarLlave.png')

    // CAJAS
    this.load.spritesheet('crateBreak', '/img/box/crateBreak.png', { frameWidth: 32, frameHeight: 32 })

    // LLAVES
    this.load.image('key1', '/img/keys/Key1-SILVER.png')
    this.load.image('imgRecogerLlave', '/img/instruction/imgRecogerLlave.png')
    this.load.spritesheet('key2', '/img/keys-animation/Key2-SILVER.png', { frameWidth: 10, frameHeight: 28 })
    this.load.spritesheet('key6', '/img/keys-animation/Key6-SILVER.png', { frameWidth: 16, frameHeight: 35 })

    // PUERTA
    this.load.image("greenDoor", "/img/door/greenDoor.png")
    this.load.image("redDoor", "/img/door/redDoor.png")

    // JUGADOR
    this.load.image('player', '/img/character/defaultCharacter.png')
    this.load.spritesheet('playerWalk', '/img/animatics-player/playerWalk.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('playerJump', '/img/animatics-player/playerJump.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('playerAttack', '/img/animatics-player/playerAttack.png', { frameWidth: 48, frameHeight: 32 })
    this.load.spritesheet('playerDamage', '/img/animatics-player/playerDamage.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('playerDead', '/img/animatics-player/playerDead.png', { frameWidth: 64, frameHeight: 32 })

    // ENEMIGO
    this.load.spritesheet('enemyWalk', '/img/animatics-enemy/enemyWalk.png', { frameWidth: 48, frameHeight: 32 })
    this.load.spritesheet('enemy2Attack', '/img/animatics-enemy/enemyAttack.png', { frameWidth: 48, frameHeight: 32 })
    this.load.spritesheet('explosion', '/img/animatics-enemy/explosion.png', { frameWidth: 48, frameHeight: 32 })
    this.load.spritesheet('enemyDamage', '/img/animatics-enemy/enemyDamage.png', { frameWidth: 48, frameHeight: 32 })
    this.load.spritesheet('proyectile', '/img/animatics-enemy/enemy2attackeffect.png', { frameWidth: 48, frameHeight: 32 })
  }

  create() {
    console.log('Nivel 1 iniciado')
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

    this.bg1 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax').setOrigin(0)
    this.bg2 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax2').setOrigin(0)
    this.bg3 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax3').setOrigin(0)
    this.bg4 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax4').setOrigin(0)
    this.bg5 = this.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax5').setOrigin(0)

    this.bg5.y = fondoY + 100
    this.bg4.y = fondoY + 110

    this.bg1.setScrollFactor(0)
    this.bg2.setScrollFactor(0)
    this.bg3.setScrollFactor(0)
    this.bg4.setScrollFactor(0)
    this.bg5.setScrollFactor(0)

    this.bg1.setDepth(-5)
    this.bg2.setDepth(-4)
    this.bg3.setDepth(-3)
    this.bg4.setDepth(-2)
    this.bg5.setDepth(-1)

    // === MAPA ===
    const map = this.make.tilemap({ key: 'level1' })
    const groundTiles = map.addTilesetImage('ground', 'ground')
    this.doors = map.getObjectLayer('DoorObjet')
    console.log(this.doors.objects[0].properties)
    const decorationTiles = map.addTilesetImage('decorations', 'decorations')
    const boxTiles = map.addTilesetImage('box', 'box')
    const wallTiles = map.addTilesetImage('walls', 'walls')

    map.createLayer('BackGround', [groundTiles, decorationTiles, boxTiles])
    const wallsLayer = map.createLayer('Walls', [groundTiles, decorationTiles, boxTiles, wallTiles])
    wallsLayer.setCollisionByExclusion([-1])
    this.doorLayer = map.createLayer('Door', [groundTiles, decorationTiles, boxTiles])
    const groundLayer = map.createLayer('Ground', [groundTiles, decorationTiles, boxTiles])

    const puerta = this.doors.objects[0]
    this.puertaSprite = this.add.image(puerta.x + 32, puerta.y + 32, 'redDoor')

    groundLayer.setCollisionByExclusion([-1])

    this.imgSaltar = this.add.image(530, 800, 'imgSaltar')
    this.imgSaltar.setScale(0.25)
    this.imgDerecha = this.add.image(300, 600, 'imgDerecha')
    this.imgDerecha.setScale(0.25)
    this.imgIzquierda = this.add.image(150, 600, 'imgIzquierda')
    this.imgIzquierda.setScale(0.25)
    this.imgAtacar = this.add.image(700, 650, 'imgAtacar')
    this.imgAtacar.setScale(0.25)
    this.imgInsertarLlave = this.add.image(1600, 500, 'imgInsertarLlave')
    this.imgInsertarLlave.setScale(0.25)

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.physicsService.setBounds(map.widthInPixels, map.heightInPixels)
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
    this.anims.create({ key: 'caminar', frames: this.anims.generateFrameNumbers('playerWalk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'saltar', frames: this.anims.generateFrameNumbers('playerJump', { start: 0, end: 6 }), frameRate: 3, repeat: 0 })
    this.anims.create({ key: 'atacar', frames: this.anims.generateFrameNumbers('playerAttack', { start: 0, end: 12 }), frameRate: 18, repeat: 0 })
    this.anims.create({ key: 'playerDie', frames: this.anims.generateFrameNumbers('playerDead', { start: 0, end: 5 }), frameRate: 12, repeat: 0 })
    this.anims.create({ key: 'playerDamage', frames: this.anims.generateFrameNumbers('playerDamage', { start: 0, end: 5 }), frameRate: 12, repeat: 0 })

    // === ANIMACIONES ENEMIGO ===
    this.anims.create({ key: 'enemyWalk', frames: this.anims.generateFrameNumbers('enemyWalk', { start: 0, end: 4 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'enemyAttack', frames: this.anims.generateFrameNumbers('enemy2Attack', { start: 0, end: 4 }), frameRate: 10, repeat: -1 })
    this.anims.create({ key: 'enemyDamage', frames: this.anims.generateFrameNumbers('enemyDamage', { start: 0, end: 4 }), frameRate: 12, repeat: 0 })
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

    this.imgRecogerLlave = this.add.image(0, 0, 'imgRecogerLlave')
    this.imgRecogerLlave.setScale(0.25)
    this.imgRecogerLlave.setDepth(1000)
    this.imgRecogerLlave.setVisible(false)

    // === COLISIONES VIA PHYSICSSERVICE (DIP) ===
    for (let i = 0; i < this.boxes.length; i++) {
      for (let j = i + 1; j < this.boxes.length; j++) {
        this.physicsService.addCollider(this.boxes[i], this.boxes[j])
      }
    }

    this.physicsService.addCollider(this.player, groundLayer)

    this.enemies.getChildren().forEach((enemy) => {
      this.physicsService.addCollider(enemy, groundLayer)
    })

    this.boxes.forEach((box) => {
      this.physicsService.addCollider(box, groundLayer)
    })

    this.boxes.forEach((box) => {
      this.physicsService.addCollider(this.player, box)
    })

    this.physicsService.addCollider(this.keys, groundLayer)

    this.physicsService.addOverlap(this.player, this.proyectiles, (player, proyectil) => {
      player.recibirDano(20)
      proyectil.destroy()
    })
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

  update() {
    const presionoG = this.inputService.isInteracting()

    if (this.player.active && this.player.y > 900) {
      this.player.recibirDano(9999)
    }

    if (this.player && this.player.active) {
      this.playerController.handleInput()
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
      this.imgRecogerLlave.setPosition(this.llaveCercana.x, this.llaveCercana.y - 40)
      this.imgRecogerLlave.setVisible(true)
    } else {
      this.imgRecogerLlave.setVisible(false)
    }

    if (presionoG && this.llaveCercana) {
      this.player.recogerLlave(this.llaveCercana)
      this.llaveCercana = null
    }

    this.puertaCercana = null

    this.doors.objects.forEach((puerta) => {
      const distancia = Phaser.Math.Distance.Between(this.player.x, this.player.y, puerta.x, puerta.y)

      if (distancia < 80) {
        this.puertaCercana = puerta

        const llaveNecesaria = puerta.properties.find(p => p.name === "llave_necesaria")?.value
        const tieneLlave = this.player.llaves.some(llave => llave.texture === llaveNecesaria)

        console.log("Necesita:", llaveNecesaria)
        console.log("¿Tiene la llave?", tieneLlave)

        if (presionoG && tieneLlave && !puerta.abierta) {
          console.log("Puerta abierta")
          this.puertaSprite.setTexture("greenDoor")
          puerta.abierta = true
        }
      }
    })
  }
}
