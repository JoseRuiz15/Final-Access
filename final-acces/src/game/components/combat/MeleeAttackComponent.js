import EntityFactory from '../../factories/EntityFactory.js'

export default class MeleeAttackComponent {
  constructor(player) {
    this.player = player
    this.dano = 20
  }

  execute() {
    if (this.player.ataque || this.player.recibiendoDano || this.player.muerto) return

    this.player.setVelocityX(0)
    this.player.ataque = true
    this.player.play('atacar')

    const offsetX = this.player.flipX ? -30 : 30
    const hitbox = EntityFactory.createAttackHitbox(
      this.player.scene,
      this.player.x + offsetX,
      this.player.y,
      this.dano,
      this.player,
    )

    // Enemies overlap - use Phaser Group directly
    const enemiesGroup = this.player.enemies
    if (enemiesGroup && enemiesGroup.getChildren) {
      this.player.scene.physics.add.overlap(hitbox, enemiesGroup, (_, enemigo) => {
        const muerto = enemigo.takeDamage(hitbox.damage)
        if (muerto) {
          this.player.scene.onEnemyDied?.()
        }
        // Do NOT destroy hitbox here - allow multiple enemies hit
      })
    }

    // Boxes overlap - ensure it's a Phaser Group
    const boxes = this.player.boxes
    if (boxes) {
      const boxesGroup = Array.isArray(boxes)
        ? this.player.scene.physics.add.group({ children: boxes })
        : boxes

      this.player.scene.physics.add.overlap(hitbox, boxesGroup, (_, caja) => {
        caja.break()
      })
    }
  }
}
