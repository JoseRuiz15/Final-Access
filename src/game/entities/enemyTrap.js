import Phaser from 'phaser'
import EntityFactory from '../factories/EntityFactory.js'

export default class EnemyTrap extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config = {}) {
    const texture = config.texture ?? 'enemyTrap'
    super(scene, x, y, texture)

    this.scene = scene
    this.idleTexture = texture
    this.attackAnimation = config.attackAnimation ?? 'enemyTrapAttack'
    this.projectileTexture = config.projectileTexture ?? 'enemyBulletTrap'
    this.detectionRange = config.detectionRange ?? 280
    this.attackCooldown = config.attackCooldown ?? 1200
    this.damage = config.damage ?? 20
    this.muzzleOffsetX = config.muzzleOffsetX ?? 0
    this.muzzleOffsetY = config.muzzleOffsetY ?? 16
    this.projectileOptions = {
      animation: null,
      scale: 1.5,
      speed: 320,
      hitboxWidth: 10,
      hitboxHeight: 10,
      hitboxOffsetX: 11,
      hitboxOffsetY: 11,
      lifetime: 2400,
      depth: 4,
      ...config.projectileOptions,
    }

    this.target = null
    this.attacking = false
    this.attackTarget = null
    this.nextAttackAt = 0

    this.setDepth(config.depth ?? 3)
    this.setScale(config.scale ?? 2)
    scene.add.existing(this)
    this.on(`animationcomplete-${this.attackAnimation}`, this._finishAttack, this)
  }

  update() {
    if (this.attacking || this.scene.time.now < this.nextAttackAt) return
    if (!this._detectsTarget(this.target)) return

    this.attacking = true
    this.attackTarget = this.target
    this.play(this.attackAnimation, true)
  }

  _detectsTarget(target) {
    if (!target?.active || target.muerto || target.y <= this.y) return false

    return Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= this.detectionRange
  }

  _finishAttack() {
    const target = this.attackTarget
    this.attacking = false
    this.attackTarget = null
    this.nextAttackAt = this.scene.time.now + this.attackCooldown
    this.setTexture(this.idleTexture)

    if (target?.active && !target.muerto) this._fireAt(target)
  }

  _fireAt(target) {
    const projectile = EntityFactory.createProjectile(
      this.scene,
      this.x + this.muzzleOffsetX,
      this.y + this.muzzleOffsetY,
      this.projectileTexture,
      this.projectileOptions,
    )
    projectile.dano = this.damage
    projectile.dispararHacia(target.x, target.y)
    // El sprite de la bala está dibujado vertical; ajusta su eje visual a la trayectoria.
    projectile.setRotation(projectile.rotation - Math.PI / 2)

    this.scene.physics.add.overlap(projectile, target, (_, player) => {
      if (!player.active) return

      player.recibirDano(this.damage)
      projectile.destroy()
    })
  }
}
