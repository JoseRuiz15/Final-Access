import ICollisionRule from '../../interfaces/ICollisionRule.js'

export default class KeyGroundRule extends ICollisionRule {
  setup(physicsService, entities) {
    if (!entities.keys) return
    physicsService.addCollider(entities.keys, entities.groundLayer)
  }
}
