import Phaser from 'phaser'

class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, options = {}) {
    super(scene, x, y, texture)
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.setAllowGravity(false)

    this.velocidad = options.speed ?? 350
    this.animationKey = options.animation ?? null

    this.setScale(options.scale ?? 1)
    this.body.setSize(options.hitboxWidth ?? 8, options.hitboxHeight ?? 6)
    this.body.setOffset(options.hitboxOffsetX ?? 20, options.hitboxOffsetY ?? 20)

    if (options.depth !== undefined) this.setDepth(options.depth)

    if (options.lifetime) {
      scene.time.delayedCall(options.lifetime, () => {
        if (this.active) this.destroy()
      })
    }
  }

  disparar(direccion) {
    if (this.animationKey && this.scene.anims.exists(this.animationKey)) {
      this.play(this.animationKey, true)
    }
    this.setVelocityX(direccion * this.velocidad)
    this.setFlipX(direccion < 0)
  }

  dispararHacia(x, y) {
    const angulo = Phaser.Math.Angle.Between(this.x, this.y, x, y)
    this.scene.physics.velocityFromRotation(angulo, this.velocidad, this.body.velocity)
    this.setRotation(angulo)
  }
}

export default Projectile
