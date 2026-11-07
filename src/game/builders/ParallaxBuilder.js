export default class ParallaxBuilder {
  static create(scene, layers, zoom = scene.cameras.main.zoom || 0.8) {
    const elements = layers.map((layer) => {
      const bg = scene.add.tileSprite(0, 0, 1, 1, layer.key).setOrigin(0)
      bg.setScrollFactor(0)
      bg.setDepth(layer.depth ?? 0)

      return {
        bg,
        speed: layer.speed,
        offsetY: layer.offsetY ?? 0,
        fit: layer.fit ?? false,
        tileScale: layer.tileScale ?? 1,
        contentHeight: layer.contentHeight ?? null,
        alignBottom: layer.alignBottom ?? false,
        tileOffsetY: layer.tileOffsetY ?? 0,
      }
    })

    const parallax = { elements }
    this.resize(parallax, scene, zoom)
    return parallax
  }

  static resize(parallax, scene, zoom = scene.cameras.main.zoom || 0.8) {
    if (!parallax?.elements?.length) return

    const viewWidth = Math.max(1, scene.scale.width)
    const viewHeight = Math.max(1, scene.scale.height)
    const fondoAncho = viewWidth / zoom
    const fondoAlto = viewHeight / zoom
    const fondoX = (viewWidth - fondoAncho) / 2
    const fondoY = (viewHeight - fondoAlto) / 2

    parallax.elements.forEach((element) => {
      const {
        bg,
        offsetY,
        fit,
        tileScale,
        contentHeight,
        alignBottom,
        tileOffsetY,
      } = element

      bg.setPosition(fondoX, fondoY + offsetY)
      bg.setSize(fondoAncho, fondoAlto)

      // "fit" escala la imagen al fondo completo; las otras capas conservan
      // su escala de mosaico y se extienden a todo el tamaño de la pantalla.
      if (fit) {
        bg.setTileScale(fondoAncho / bg.frame.width, fondoAlto / bg.frame.height)
      } else if (typeof tileScale === 'number') {
        bg.setTileScale(tileScale)
      } else if (tileScale) {
        bg.setTileScale(tileScale.x ?? 1, tileScale.y ?? 1)
      }

      if (contentHeight !== null) {
        const altoVisible = contentHeight * bg.tileScaleY
        bg.setSize(fondoAncho, altoVisible)
        if (alignBottom) bg.y = fondoY + offsetY + fondoAlto - altoVisible
      }

      bg.tilePositionY = tileOffsetY
    })
  }

  static update(parallax, scrollX) {
    if (!parallax || !parallax.elements) return
    parallax.elements.forEach(({ bg, speed }) => {
      bg.tilePositionX += (scrollX * speed - bg.tilePositionX) * 0.08
    })
  }
}
