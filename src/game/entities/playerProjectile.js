import Phaser from 'phaser'

export default class PlayerProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, damage, options = {}) {
    const textura = options.texture ?? 'character3Projectile'
    super(scene, x, y, textura)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.damage = damage
    this.velocidad = options.speed ?? 420
    this.pierceBoxes = options.pierceBoxes ?? false
    this.setDisplaySize(options.displaySize ?? 48, options.displaySize ?? 48)
    this.setDepth(2)

    this.body.setAllowGravity(false)
    // Hitbox pequeño centrado en el destello del sprite, no en todo el cuadro.
    const hitboxSize = options.hitboxSize ?? 8
    this.body.setSize(hitboxSize, hitboxSize)
    const hitboxOffset = (32 - hitboxSize) / 2
    this.body.setOffset(
      options.hitboxOffsetX ?? hitboxOffset,
      options.hitboxOffsetY ?? hitboxOffset,
    )

    // `animation: null` permite usar una imagen fija, como bullet.png.
    if (options.animation !== null) {
      const animation = options.animation ?? 'cosa3Projectile'
      if (scene.anims.exists(animation)) this.play(animation, true)
    }

    // Evita que un disparo que no choque permanezca en el nivel indefinidamente.
    scene.time.delayedCall(options.lifetime ?? 2200, () => {
      if (this.active) this.destroy()
    })
  }

  disparar(direccion) {
    this.setFlipX(direccion < 0)
    this.setVelocityX(direccion * this.velocidad)
  }
}
