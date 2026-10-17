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
    this.idleTexture = texture

    this.setDisplaySize(48, 48)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(1) 
    this.body.setCollideWorldBounds(false)

    // ★ Caja de colisión — ajústala a tu gusto
    this.body.setSize(22, 30)    // ancho, alto del hitbox
    this.body.setOffset(5, 1)    // desplazamiento X, Y respecto al sprite
    this.body.debugShowBody = false
    this.body.debugBodyColor = 0x00ff00
    this._idleOriginX = this.originX
    this._idleOriginY = this.originY
    this._idleFrameWidth = this.frame.realWidth
    this._idleBodyOffsetX = this.body.offset.x
    this._idleBodyOffsetY = this.body.offset.y
    this.on('animationstart', () => this.alignJumpSpriteWithHitbox())

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

  alignJumpSpriteWithHitbox() {
    if (!this.body || !this.frame) return

    const isCosa2 = this.idleTexture === 'cosa2'
    const isCosa2NormalAttack = isCosa2 && this.texture.key === 'character2Attack1'
    const isCosa2JumpAttack = isCosa2 && this.texture.key === 'character2JumpAttack'
    const isCosa2Attack = isCosa2NormalAttack || isCosa2JumpAttack
    const isCosa1Attack = this.idleTexture === 'player' && this.texture.key === 'playerAttack'
    const isAttackAnimation = isCosa2Attack || isCosa1Attack
    // El ajuste de origen y offset alinea la hitbox con los pies en los cuadros
    // altos de salto de Cosa 2 y Cosa 3.
    const isCosa2Jump = isCosa2 && this.texture.key === 'character2Jump'
    const isCosa3Jump = this.idleTexture === 'cosa3' && this.texture.key === 'character3Jump'
    const isCosa3JumpAttack =
      this.idleTexture === 'cosa3' && this.texture.key === 'character3JumpAttack'
    const isTallJumpAnimation = isCosa2Jump || isCosa3Jump || isCosa3JumpAttack
    // Ambas láminas dibujan al personaje cerca de x=16; al voltear la imagen se refleja el pivote.
    const attackPivotX = isCosa2JumpAttack || isCosa1Attack ? 16 / 48 : 16 / 64
    const originX = isAttackAnimation
      ? this.flipX
        ? 1 - attackPivotX
        : attackPivotX
      : this._idleOriginX
    // Compensa el cambio de origen para que la caja física no se desplace al atacar hacia la izquierda.
    const offsetX = isAttackAnimation
      ? this._idleBodyOffsetX + this.frame.realWidth * originX - this._idleFrameWidth * this._idleOriginX
      : this._idleBodyOffsetX
    // El ataque aéreo conserva la misma caja física del salto y alinea los pies de sus cuadros de 48 px.
    const originY = isTallJumpAnimation ? 0.698 : isCosa2JumpAttack ? 0.636 : this._idleOriginY
    const offsetY = isTallJumpAnimation ? 17.5 : isCosa2JumpAttack ? 14.5 : this._idleBodyOffsetY

    if (
      this.originX === originX &&
      this.originY === originY &&
      this.body.offset.x === offsetX &&
      this.body.offset.y === offsetY
    ) {
      return
    }

    this.setOrigin(originX, originY)
    this.body.setOffset(offsetX, offsetY)
    this.body.updateFromGameObject()
  }

  atacar() {
    this.attack.execute()
  }

  manejarEntradaAtaqueCosa3(pressed, down, released) {
    this.attack.manejarEntradaCosa3(pressed, down, released)
  }

  cancelarCargaAtaque() {
    this.attack.cancelarCargaCosa3()
  }

  recogerLlave(llave) {
    this.inventory.pickUp(llave)
  }

  soltarLlave() {
    if (!this.active || this.muerto || !this.body) return false

    const direccion = this.flipX ? -1 : 1
    const x = this.body.center.x + direccion * 30
    const y = this.body.bottom - 12

    // La llave cae desde el frente del jugador sin recibir impulso horizontal.
    return this.inventory.devolverUltimaLlaveAlMapa(x, y, 0, 0)
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
