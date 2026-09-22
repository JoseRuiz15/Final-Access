export default class ParallaxBuilder {
  static create(scene, layers, scale = 0.8) {
    const fondoAncho = scene.scale.width / scale
    const fondoAlto = scene.scale.height / scale
    const fondoX = (scene.scale.width - fondoAncho) / 2
    const fondoY = (scene.scale.height - fondoAlto) / 2

    const elements = layers.map(({ key, speed, depth = 0, offsetY = 0 }) => {
      const bg = scene.add
        .tileSprite(fondoX, fondoY + offsetY, fondoAncho, fondoAlto, key)
        .setOrigin(0)
      bg.setScrollFactor(0)
      bg.setDepth(depth)
      return { bg, speed }
    })

    return { elements }
  }

  static update(parallax, scrollX) {
    if (!parallax || !parallax.elements) return
    parallax.elements.forEach(({ bg, speed }) => {
      bg.tilePositionX += (scrollX * speed - bg.tilePositionX) * 0.08
    })
  }
}
