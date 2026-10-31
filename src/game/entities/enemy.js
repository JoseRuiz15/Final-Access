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
    this.config = config

    // Claves configurables para reutilizar la entidad con distintos enemigos.
    this.animWalk = config.animWalk ?? 'enemyWalk'
    this.animAttack = config.animAttack === undefined ? 'enemyAttack' : config.animAttack
    this.animDamage = config.animDamage === undefined ? 'enemyDamage' : config.animDamage
    this.animDie = config.animDie === undefined ? 'enemyDie' : config.animDie

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(config.depth ?? 1)
    // El sprite usa cuadros de 48x32. La hitbox es más baja, pero conserva
    // su base alineada con los pies para que no se hunda al tocar el suelo.
    this.body.setSize(44, 24)
    this.body.setOffset(2, 8)
    // Oculta el contorno de depuración sin cambiar la hitbox ni sus colisiones.
    this.body.debugShowBody = false
    this.body.debugBodyColor = 0xff00ff

    this.setScale(config.scale ?? 1.5)
    this.setCollideWorldBounds(true)

    // Proyectil del escarabajo: la bala es independiente del fogonazo.
    this.projectileTexture = config.projectileTexture ?? 'enemy2Bullet'
    this.projectileOptions = {
      animation: null,
      scale: 1,
      speed: 350,
      hitboxWidth: 19,
      hitboxHeight: 6,
      hitboxOffsetX: 7,
      hitboxOffsetY: 13,
      lifetime: 3000,
      depth: 4,
      ...config.projectileOptions,
    }
    // La bala nace en la boca, a la altura del fogonazo.
    this.muzzleOffsetX = config.muzzleOffsetX ?? 10
    this.muzzleOffsetY = config.muzzleOffsetY ?? 10
    this.fireDelay = config.fireDelay ?? 280
    this.attackLockMs = config.attackLockMs ?? 900
    // El escarabajo solo dispara cuando el jugador está a su altura.
    // El dron desactiva esta regla porque apunta hacia arriba/abajo.
    this.fireOnlySameLevel = config.fireOnlySameLevel ?? true
    this.sameLevelTolerance = config.sameLevelTolerance ?? 32
    this.aimAtTarget = config.aimAtTarget ?? true

    // Fogonazo del disparo: capa visual independiente del cuerpo. El arte
    // ya está alineado con la boca, así que se coloca en la misma posición.
    this.attackEffectAnim = config.attackEffectAnim ?? 'enemy2AttackEffect'
    this.attackEffectTexture = config.attackEffectTexture ?? this.attackEffectAnim
    this.attackEffectOffsetX = config.attackEffectOffsetX ?? 0
    this.attackEffectOffsetY = config.attackEffectOffsetY ?? 0
    this.attackEffect = null
    this._hasBaseAttackEffect = false

    if (
      config.attackEffect !== false &&
      this.attackEffectTexture &&
      scene.textures.exists(this.attackEffectTexture)
    ) {
      this.attackEffect = scene.add.sprite(this.x, this.y, this.attackEffectTexture)
      this.attackEffect.setScale(this.scaleX, this.scaleY)
      this.attackEffect.setDepth((config.depth ?? 1) + 1)
      this.attackEffect.setVisible(false)
      this.attackEffect.on('animationcomplete', () => {
        this.attackEffect?.setVisible(false)
      })
      this.once('destroy', () => this.attackEffect?.destroy())
      this._hasBaseAttackEffect = true
    }

    this._vida = config.vida || 40
    this._velocidad = config.velocidad || 50
    this._dano = config.dano ?? 20
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
      // El escarabajo detecta y dispara desde más lejos que antes.
      rangoDeteccion: config.rangoDeteccion ?? 280,
      rangoAtaque: config.rangoAtaque ?? 200,
      margenPersecucionX: config.margenPersecucionX,
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
    this._syncAttackEffect()
  }

  getType() {
    return 'enemy'
  }

  atacar() {
    if (this.fireOnlySameLevel && !this._isTargetOnSameLevel()) return

    this.attack.atacar()
  }

  _isTargetOnSameLevel() {
    const target = this.target
    if (!target?.active) return false

    return Math.abs(target.y - this.y) <= this.sameLevelTolerance
  }

  playAttackAnimation() {
    if (this.animAttack && this.scene.anims.exists(this.animAttack)) {
      this.play(this.animAttack, true)
    }
    this._playAttackEffect()
  }

  _playAttackEffect() {
    if (!this.attackEffect || !this.scene.anims.exists(this.attackEffectAnim)) return

    this._syncAttackEffect()
    this.attackEffect.setVisible(true)
    this.attackEffect.play(this.attackEffectAnim)
  }

  _syncAttackEffect() {
    if (!this._hasBaseAttackEffect || !this.attackEffect) return

    // Los frames originales miran a la izquierda; al voltear el cuerpo el
    // efecto se refleja con él.
    const dir = this.flipX ? 1 : -1
    this.attackEffect.setPosition(
      this.x + this.attackEffectOffsetX * dir,
      this.y + this.attackEffectOffsetY,
    )
    this.attackEffect.setFlipX(this.flipX)

    if (!this.active || this.muerto) {
      this.attackEffect.setVisible(false)
    }
  }
}
