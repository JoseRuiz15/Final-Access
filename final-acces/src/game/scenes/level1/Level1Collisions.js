/**
 * Clase encargada de configurar colisiones y overlaps físicos.
 * Utiliza PhysicsService para manejar todas las interacciones del Level 1.
 */
export default class Level1Collisions {

  constructor(scene) {
    this.scene = scene
  }

  setup(player, enemies, boxes, keysGroup, groundLayer) {
    const { physicsService } = this.scene

    // Colisiones entre cajas
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        physicsService.addCollider(boxes[i], boxes[j])
      }
    }

    // Colisiones jugador - tierra
    physicsService.addCollider(player, groundLayer)

    // Colisiones enemigos - tierra
    enemies.getChildren().forEach((enemy) => {
      physicsService.addCollider(enemy, groundLayer)
    })

    // Colisiones cajas - tierra
    boxes.forEach((box) => {
      physicsService.addCollider(box, groundLayer)
    })

    // Colisiones jugador - cajas
    boxes.forEach((box) => {
      physicsService.addCollider(player, box)
    })

    // Overlap jugador - proyectiles
    physicsService.addOverlap(player, this.scene.proyectiles, (player, proyectil) => {
      player.recibirDano(20)
      proyectil.destroy()
    })
  }
}