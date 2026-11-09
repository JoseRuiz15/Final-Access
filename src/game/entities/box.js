import Entity from './Entity.js'
import EntityFactory from '../factories/EntityFactory.js'
import { playPlayerSoundEffect } from '../services/PlayerSoundEffects.js'

class Box extends Entity {
  constructor(scene, x, y, keyData = null) {
    super(scene, x, y, 'box')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    if (!scene.anims.exists('boxBreak')) {
      scene.anims.create({
        key: 'boxBreak',
        frames: scene.anims.generateFrameNumbers('crateBreak', { start: 0, end: 4 }),
        frameRate: 12,
        repeat: 0,
      })
    }

    this.on('animationcomplete-boxBreak', () => {
      if (this.keyData) {
        const llave = EntityFactory.createKey(
          this.scene,
          this.x,
          this.y - 100,
          this.keyData.texture,
          this.keyData,
        )
        this.scene.time.delayedCall(0, () => {
          llave.setVelocityY(-150)
          llave.setVelocityX(0)
        })
        this.scene.keys.add(llave)
        this.scene.events?.emit('box-key-spawned', llave)
      }
      this.destroy()
    })

    this.setImmovable(true)
    this.body.setAllowGravity(false)
    this.keyData = keyData
    this.rompiendo = false
  }

  break({ broadcast = true } = {}) {
    if (!this.active || this.rompiendo) return

    this.rompiendo = true
    if (broadcast) this.scene.events?.emit('box-broken', this)
    playPlayerSoundEffect(this.scene, 'brokenBox')
    this.body.enable = false
    this.setTexture('crateBreak')
    this.play('boxBreak')
  }

  getType() {
    return 'box'
  }
}

export default Box
