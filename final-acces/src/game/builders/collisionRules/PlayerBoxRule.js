import ICollisionRule from '../../interfaces/ICollisionRule.js'
import { toArray } from './helpers.js'

export default class PlayerBoxRule extends ICollisionRule {
  setup(physicsService, entities) {
    if (!entities.boxes) return
    toArray(entities.boxes).forEach((box) => {
      physicsService.addCollider(entities.player, box)
    })
  }
}
