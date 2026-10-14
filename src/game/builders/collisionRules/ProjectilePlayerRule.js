import ICollisionRule from '../../interfaces/ICollisionRule.js'

export default class ProjectilePlayerRule extends ICollisionRule {
  setup(physicsService, entities) {
    if (!entities.proyectiles) return
    physicsService.addOverlap(entities.player, entities.proyectiles, (player, proyectil) => {
      player.recibirDano(20)
      proyectil.destroy()
    })
  }
}
