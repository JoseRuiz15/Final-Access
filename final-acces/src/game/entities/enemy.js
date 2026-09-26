import Entity from './Entity.js'
import PatrolAI from '../components/ai/PatrolAI.js'
import RangedAttackComponent from '../components/combat/RangedAttackComponent.js'
import EnemyHealthComponent from '../components/health/EnemyHealthComponent.js'
import EnemyAnimationComponent from '../components/animation/EnemyAnimationComponent.js'

/** @implements {IEntity} */
export default class Enemy extends Entity {
  constructor(scene, x, y, texture, config = {}, gameRepository) {
    super(scene, x, y, texture)
    this.scene = scene
    this.gameRepository = gameRepository
    this._target = null

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setScale(1.5)
    this.setCollideWorldBounds(true)

    this._vida = config.vida || 40
    this._velocidad = config.velocidad || 50
    this._dano = 20
    this._direccion = 1
    this._atacando = false
    this._puedeDisparar = true
    this._recibiendoDano = false
    this._muerto = false
    this._limiteIzquierdo = config.limiteIzquierdo || 670
    this._limiteDerecho = config.limiteDerecho || 1100

    this.ai = new PatrolAI(this, {
      velocidad: this._velocidad,
      limiteIzquierdo: this._limiteIzquierdo,
      limiteDerecho: this._limiteDerecho,
    })
    this.attack = new RangedAttackComponent(this)
    this.health = new EnemyHealthComponent(this, gameRepository)
    this.animation = new EnemyAnimationComponent(this)
  }

  get vida() {
    return this._vida
  }
  set vida(v) {
    this._vida = v
  }

  get velocidad() {
    return this._velocidad
  }
  set velocidad(v) {
    this._velocidad = v
  }

  get dano() {
    return this._dano
  }

  get direccion() {
    return this._direccion
  }
  set direccion(v) {
    this._direccion = v
  }

  get atacando() {
    return this._atacando
  }
  set atacando(v) {
    this._atacando = v
  }

  get puedeDisparar() {
    return this._puedeDisparar
  }
  set puedeDisparar(v) {
    this._puedeDisparar = v
  }

  get recibiendoDano() {
    return this._recibiendoDano
  }
  set recibiendoDano(v) {
    this._recibiendoDano = v
  }

  get muerto() {
    return this._muerto
  }
  set muerto(v) {
    this._muerto = v
  }

  get limiteIzquierdo() {
    return this._limiteIzquierdo
  }
  set limiteIzquierdo(v) {
    this._limiteIzquierdo = v
  }

  get limiteDerecho() {
    return this._limiteDerecho
  }
  set limiteDerecho(v) {
    this._limiteDerecho = v
  }

  

  set target(t) {
    this._target = t
  }

  get target() {
  return this._target
}

  takeDamage(amount) {
    return this.health.takeDamage(amount)
  }

  update(_delta) {
    this.ai.update()
  }

  getType() {
    return 'enemy'
  }

  atacar() {
    this.attack.atacar()
  }
}
