import Entity from './Entity.js'
import MovementComponent from '../components/movement/MovementComponent.js'
import MeleeAttackComponent from '../components/combat/MeleeAttackComponent.js'
import InventoryComponent from '../components/inventory/InventoryComponent.js'
import PlayerHealthComponent from '../components/health/PlayerHealthComponent.js'
import PlayerAnimationComponent from '../components/animation/PlayerAnimationComponent.js'

/** @implements {IEntity} */
export default class Player extends Entity {
  constructor(scene, x, y, texture, gameRepository) {
    super(scene, x, y, texture)

    this.spawnX = x
    this.spawnY = y
    this.gameRepository = gameRepository
    this._enemies = null
    this._boxes = null

    this.setDisplaySize(48, 48)
    this.texture = texture

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.setCollideWorldBounds(false)

    this.movement = new MovementComponent(this)
    this.attack = new MeleeAttackComponent(this)
    this.inventory = new InventoryComponent(this, gameRepository)
    this.health = new PlayerHealthComponent(this, gameRepository)
    this.animation = new PlayerAnimationComponent(this)
  }

  get vida() {
    return this.health.vida
  }
  set vida(v) {
    this.health.vida = v
  }

  get maxVida() {
    return this.health.maxVida
  }

  get vidas() {
    return this.health.vidas
  }
  set vidas(v) {
    this.health.vidas = v
  }

  get velocidad() {
    return this.movement.velocidad
  }

  get dano() {
    return this.attack.dano
  }

  get ataque() {
    return this.health.muerto ? false : this._ataque
  }
  set ataque(v) {
    this._ataque = v
  }
  _ataque = false

  get muerto() {
    return this.health.muerto
  }
  set muerto(v) {
    this.health.muerto = v
  }

  get recibiendoDano() {
    return this.health.recibiendoDano
  }
  set recibiendoDano(v) {
    this.health.recibiendoDano = v
  }

  get llaves() {
    return this.inventory.llaves
  }

 get enemies() {
  return this._enemies
}
set enemies(e) {
  this._enemies = e
}

get boxes() {
  return this._boxes
}
set boxes(b) {
  this._boxes = b
}


  takeDamage(amount) {
    return this.health.takeDamage(amount)
  }

  update(delta) {
    this.movement.update(delta)
    this.animation.update(delta)
  }

  atacar() {
    this.attack.execute()
  }

  recogerLlave(llave) {
    this.inventory.pickUp(llave)
  }

  recibirDano(dano) {
    this.health.recibirDano(dano)
  }

  respawn() {
    this.health.respawn()
  }

  getType() {
    return 'player'
  }

  moverIzquierda() {
    this.movement.moveLeft()
  }

  moverDerecha() {
    this.movement.moveRight()
  }

  detenerMovimiento() {
    this.movement.stop()
  }

  saltar() {
    this.movement.jump()
  }
}
