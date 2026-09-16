import Phaser from 'phaser'
import EntityFactory from '../factories/EntityFactory.js'
import PhysicsService from '../services/PhysicsService.js'
import InputService from '../services/InputService.js'
import GameRepository from '../repositories/GameRepository.js'
import PlayerController from '../controllers/PlayerController.js'
import AssetLoader from '../builders/AssetLoader.js'
import ParallaxBuilder from '../builders/ParallaxBuilder.js'
import MapBuilder from '../builders/MapBuilder.js'
import CollisionSetup from '../builders/CollisionSetup.js'
import AnimationRegistry from '../builders/AnimationRegistry.js'
import { LEVEL2_CONFIG } from '../configs/level2Config.js'

/** @implements {ISceneContract} */
export default class Level2Scene extends Phaser.Scene {

    constructor() {
        super('Level2Scene')
    }

    preload() {
        AssetLoader.load(this, LEVEL2_CONFIG.assets)
    }

    create() {
        this.cameras.main.setZoom(0.8)

        this.physicsService = new PhysicsService(this)
        this.inputService = new InputService(this)
        this.gameRepository = new GameRepository()

        AnimationRegistry.registerAll(this)

        this.parallax = ParallaxBuilder.create(this, LEVEL2_CONFIG.parallax)

        const mapResult = MapBuilder.create(this, LEVEL2_CONFIG.map, this.physicsService)
        this.mapResult = mapResult

        const { player, controller } = this._createPlayer()
        this.player = player
        this.playerController = controller

        this.enemies = this._createEnemies()

        this.proyectiles = this.physicsService.createGroup()

        this.player.enemies = this.enemies
        this.player.boxes = []

        CollisionSetup.setup(this.physicsService, {
            player: this.player,
            enemies: this.enemies,
            boxes: [],
            keys: null,
            groundLayer: mapResult.layers['Ground'],
            proyectiles: this.proyectiles,
        })
    }

    _createPlayer() {
        const { x, y } = LEVEL2_CONFIG.player
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

        LEVEL2_CONFIG.enemies.forEach((config) => {
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
