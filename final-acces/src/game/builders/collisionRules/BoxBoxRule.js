import ICollisionRule from '../../interfaces/ICollisionRule.js'
import { toArray } from './helpers.js'

export default class BoxBoxRule extends ICollisionRule {
  setup(physicsService, entities) {
    if (!entities.boxes) return
    const boxes = toArray(entities.boxes)
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        physicsService.addCollider(boxes[i], boxes[j])
      }
    }
  }
}
