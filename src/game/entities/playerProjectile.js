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
    this.body.setSize(options.hitboxSize ?? 8, options.hitboxSize ?? 8)
    const hitboxOffset = (32 - (options.hitboxSize ?? 8)) / 2
    this.body.setOffset(hitboxOffset, hitboxOffset)

    this.play(options.animation ?? 'cosa3Projectile', true)

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
