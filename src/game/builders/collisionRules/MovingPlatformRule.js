import ICollisionRule from '../../interfaces/ICollisionRule.js'
import { toArray } from './helpers.js'

/**
 * Colisiones de las plataformas móviles con las entidades que pueden
 * pararse encima de ellas.
 */
export default class MovingPlatformRule extends ICollisionRule {
  setup(physicsService, entities) {
    const platforms = entities.movingPlatforms || []
    if (!platforms.length || !entities.player) return

    const colliders = [
      entities.player,
      ...toArray(entities.enemies),
      ...toArray(entities.boxes),
      ...toArray(entities.keys),
    ]

    platforms.forEach((platform) => {
      const platformBody = platform.bodyObject
      if (!platformBody) return

      colliders.forEach((entity) => {
        if (!entity) return
        physicsService.addCollider(entity, platformBody)
      })
    })
  }
}
