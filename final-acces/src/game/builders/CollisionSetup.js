export default class CollisionSetup {

  static setup(physicsService, { player, enemies, boxes, keys, groundLayer, proyectiles }) {
    // Box-to-box
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        physicsService.addCollider(boxes[i], boxes[j])
      }
    }

    // Player vs ground
    physicsService.addCollider(player, groundLayer)

    // Enemies vs ground
    enemies.getChildren().forEach((enemy) => {
      physicsService.addCollider(enemy, groundLayer)
    })

    // Boxes vs ground
    boxes.forEach((box) => {
      physicsService.addCollider(box, groundLayer)
    })

    // Player vs boxes
    boxes.forEach((box) => {
      physicsService.addCollider(player, box)
    })

    // Keys vs ground
    if (keys) {
      physicsService.addCollider(keys, groundLayer)
    }

    // Projectiles vs player
    physicsService.addOverlap(player, proyectiles, (player, proyectil) => {
      player.recibirDano(20)
      proyectil.destroy()
    })
  }
}
