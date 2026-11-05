import ICollisionRule from '../../interfaces/ICollisionRule.js'

export default class PlayerSpikesRule extends ICollisionRule {
  setup(physicsService, entities) {
    const { player, spikesObjects } = entities
    if (!spikesObjects || !spikesObjects.objects) return

    spikesObjects.objects.forEach((obj) => {
      const props = obj.properties?.reduce((acc, p) => ({ ...acc, [p.name]: p.value }), {})
      if (props.tipo !== 'pinchos') return

      const spikeBody = physicsService.scene.add.rectangle(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        obj.width,
        obj.height,
      )
      spikeBody.setVisible(false)
      physicsService.scene.physics.add.existing(spikeBody, true)

      // Usar scene.physics.add.overlap DIRECTAMENTE (soporta processCallback + overlapCallback)
      physicsService.addOverlap(player, spikeBody, () => {
        if (!player.muerto) player.recibirDano(30)
      })
    })
  }
}
