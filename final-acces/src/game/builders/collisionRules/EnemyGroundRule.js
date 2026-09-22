import ICollisionRule from '../../interfaces/ICollisionRule.js'

export default class EnemyGroundRule extends ICollisionRule {
  setup(physicsService, entities) {
    if (!entities.enemies) return
    entities.enemies.getChildren().forEach((enemy) => {
      physicsService.addCollider(enemy, entities.groundLayer)
    })
  }
}
