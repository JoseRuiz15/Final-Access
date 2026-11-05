import Phaser from 'phaser'

export default class InteractionManager {
  static create(scene, { player, doors, doorSprite, keysGroup }) {
    scene._interaction = {
      player,
      doors,
      doorSprite,
      keysGroup,
      llaveCercana: null,
    }
  }

  static update(scene, inputService) {
    const ctx = scene._interaction
    if (!ctx) return

    const { player, doors, doorSprite, keysGroup } = ctx
    if (!player || !keysGroup) return

    // Detectar llave cercana
    ctx.llaveCercana = null
    keysGroup.getChildren().forEach((llave) => {
      const distancia = Phaser.Math.Distance.Between(player.x, player.y, llave.x, llave.y)
      if (distancia < 80) {
        ctx.llaveCercana = llave
      }
    })

    // Recoger llave
    if (inputService.isInteracting() && ctx.llaveCercana) {
      player.recogerLlave(ctx.llaveCercana)
      ctx.llaveCercana = null
    }

    // Verificar puerta cercana
    if (!doors) return
    doors.objects.forEach((puerta) => {
      const distancia = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        puerta.x + 32,
        puerta.y + 32,
      )
      if (distancia < 80) {
        const llaveNecesaria = puerta.properties.find((p) => p.name === 'llave_necesaria')?.value
        const tieneLlave = player.llaves.some((llave) => llave.texture === llaveNecesaria)

        if (inputService.isInteracting() && tieneLlave && !puerta.abierta) {
          doorSprite.setTexture('greenDoor')
          puerta.abierta = true
        }
      }
    })
  }
}
