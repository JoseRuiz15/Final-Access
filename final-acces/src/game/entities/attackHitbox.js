import Phaser from 'phaser'

class AttackHitbox extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, width, height, damage, owner) {
    super(scene, x, y, 'player')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setDisplaySize(width, height)
    this.setVisible(false)
    this.setAlpha(0)

    this.body.setAllowGravity(false)
    this.body.setImmovable(true)
    this.body.setSize(width, height)

    this.damage = damage
    this.owner = owner

    scene.time.delayedCall(300, () => {
      if (this.active) {
        this.destroy()
      }
    })
  }
}

export default AttackHitbox
