import ICollisionRule from '../../interfaces/ICollisionRule.js'

export default class PlayerGroundRule extends ICollisionRule {
  setup(physicsService, entities) {
    physicsService.addCollider(entities.player, entities.groundLayer)
  }
}
