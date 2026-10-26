import Phaser from 'phaser'
import Enemy from './enemy.js'

/**
 * Dron volador del nivel 2/3.
 *
 * El cuerpo es el único sprite con física. El fuego del propulsor y el
 * destello del disparo son sprites visuales que siguen al cuerpo, de modo
 * que pueden reproducir sus animaciones sin cortar la animación de vuelo.
 */
export default class DroneEnemy extends Enemy {
  constructor(scene, x, y, texture, config = {}, gameRepository) {
    super(
      scene,
      x,
      y,
      texture,
      {
        ...config,
        animWalk: config.animWalk ?? 'enemyDronWalk',
        animAttack: null,
        animDamage: null,
        animDie: config.animDie ?? 'enemyDronDead',
        scale: config.scale ?? 2,
        depth: config.depth ?? 2,
        // El dron crea su propio destello con sus frames y su mira.
        attackEffect: false,
        // El dron apunta arriba/abajo, así que puede disparar a otra altura.
        fireOnlySameLevel: false,
      },
      gameRepository,
    )

    this.body.setAllowGravity(false)

    const body = config.body ?? {}
    this.body.setSize(body.width ?? 16, body.height ?? 14)
    this.body.setOffset(body.offsetX ?? 8, body.offsetY ?? 8)

    this.fireTexture = config.fireTexture ?? 'enemyDronFlyingEffect'
    this.fireAnim = config.fireAnim ?? 'enemyDronFire'
    this.attackEffectAnim = config.attackEffectAnim ?? 'enemyDronAttack'

    this.muzzleOffsetX = config.muzzleOffsetX ?? 14
    this.muzzleOffsetY = config.muzzleOffsetY ?? -3
    this.fireDelay = config.fireDelay ?? 180
    this.attackLockMs = config.attackLockMs ?? 600
    this.attackCooldown = config.attackCooldown ?? 1500
    this.aimAtTarget = config.aimAtTarget ?? true
    this.projectileTexture = config.projectileTexture ?? 'enemyDronBullet'
    this.projectileOptions = {
      animation: null,
      scale: 2,
      speed: 320,
      hitboxWidth: 6,
      hitboxHeight: 6,
      hitboxOffsetX: 13,
      hitboxOffsetY: 13,
      lifetime: 2600,
      depth: 4,
      ...config.projectileOptions,
    }

    // El cuerpo se congela en uno de los tres frames según la altura del
    // jugador. Los frames originales miran a la izquierda.
    this.aimTolerance = config.aimTolerance ?? 32
    this.aimFrames = {
      above: config.aimFrameAbove ?? 2,
      level: config.aimFrameLevel ?? 0,
      below: config.aimFrameBelow ?? 1,
    }
    // El hueco rojo cambia de altura en cada frame, así que el origen del
    // destello y de la bala se mueve con él.
    this.aimMuzzleY = {
      [this.aimFrames.above]: config.aimMuzzleYAbove ?? -16,
      [this.aimFrames.level]: config.aimMuzzleYLevel ?? -3,
      [this.aimFrames.below]: config.aimMuzzleYBelow ?? 1,
    }
    this.aiming = false
    this._aimFrame = null

    // El fuego comparte el centro del dron: sus frames ya están dibujados
    // en la parte inferior del cuadro de 32x32.
    this.fire = this._createFollower(this.fireTexture, this.fireAnim, this.depth - 1)

    // El destello de ataque se dibuja delante del agujero rojo.
    this.attackEffect = this._createFollower(
      this.attackEffectAnim,
      this.attackEffectAnim,
      this.depth + 1,
    )
    if (this.attackEffect) {
      this.attackEffect.setVisible(false)
      this.attackEffect.on('animationcomplete', () => {
        this.attackEffect?.setVisible(false)
      })
    }

    this.once('destroy', () => {
      this.fire?.destroy()
      this.attackEffect?.destroy()
    })

    if (this.animWalk && scene.anims.exists(this.animWalk)) {
      this.play(this.animWalk, true)
    }
  }

  _createFollower(texture, animation, depth) {
    if (!texture || !this.scene.textures.exists(texture)) return null

    const sprite = this.scene.add.sprite(this.x, this.y, texture)
    sprite.setScale(this.scaleX, this.scaleY)
    sprite.setDepth(depth)

    if (animation && this.scene.anims.exists(animation)) {
      sprite.play(animation)
    }

    return sprite
  }

  playAttackAnimation() {
    if (!this.attackEffect || !this.scene.anims.exists(this.attackEffectAnim)) return

    this.attackEffect.setPosition(this.x, this.y + this.muzzleOffsetY)
    this.attackEffect.setFlipX(this.flipX)
    this.attackEffect.setVisible(true)
    this.attackEffect.play(this.attackEffectAnim)
  }

  _isTargetDetected(target) {
    if (!target?.active || target.muerto || this.muerto) return false

    return (
      Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <=
      this.ai.rangoDeteccion
    )
  }

  _getAimFrame(target) {
    const diferenciaY = target.y - this.y

    if (diferenciaY < -this.aimTolerance) return this.aimFrames.above
    if (diferenciaY > this.aimTolerance) return this.aimFrames.below

    return this.aimFrames.level
  }

  _updateAim() {
    const target = this.target

    if (!this._isTargetDetected(target)) {
      if (!this.aiming) return

      this.aiming = false
      this._aimFrame = null
      if (!this.muerto && this.animWalk) this.play(this.animWalk, true)
      return
    }

    this.aiming = true
    this.setVelocity(0)
    this.setFlipX(target.x > this.x)

    const frame = this._getAimFrame(target)
    if (frame !== this._aimFrame) {
      this.anims.stop()
      this.setFrame(frame)
      this._aimFrame = frame
      this.muzzleOffsetY = this.aimMuzzleY[frame] ?? this.muzzleOffsetY
    }

    // Al detectar al jugador dispara de inmediato; el cooldown del
    // componente controla la cadencia entre disparos.
    this.atacar()
  }

  update(delta) {
    this._updateAim()
    super.update(delta)

    const visible = this.active && !this.muerto

    if (this.fire) {
      this.fire.setPosition(this.x, this.y)
      this.fire.setFlipX(this.flipX)
      this.fire.setVisible(visible)
    }

    if (this.attackEffect) {
      this.attackEffect.setPosition(this.x, this.y + this.muzzleOffsetY)
      this.attackEffect.setFlipX(this.flipX)
      if (!visible) this.attackEffect.setVisible(false)
    }
  }
}
