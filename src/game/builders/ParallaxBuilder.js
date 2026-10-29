export default class ParallaxBuilder {
  static create(scene, layers, scale = 0.8) {
    const fondoAncho = scene.scale.width / scale
    const fondoAlto = scene.scale.height / scale
    const fondoX = (scene.scale.width - fondoAncho) / 2
    const fondoY = (scene.scale.height - fondoAlto) / 2

    const elements = layers.map(
      ({
        key,
        speed,
        depth = 0,
        offsetY = 0,
        fit = false,
        tileScale = 1,
        contentHeight = null,
        alignBottom = false,
        tileOffsetY = 0,
      }) => {
        const bg = scene.add
          .tileSprite(fondoX, fondoY + offsetY, fondoAncho, fondoAlto, key)
          .setOrigin(0)

        // Las imágenes que no coinciden con el tamaño de la vista se repiten.
        // "fit" las ajusta al fondo completo; "tileScale" las amplía.
        if (fit) {
          bg.setTileScale(fondoAncho / bg.frame.width, fondoAlto / bg.frame.height)
        } else if (typeof tileScale === 'number') {
          bg.setTileScale(tileScale)
        } else if (tileScale) {
          bg.setTileScale(tileScale.x ?? 1, tileScale.y ?? 1)
        }

        // Algunas imágenes traen una base opaca que no debe verse (por ejemplo,
        // la franja negra bajo la ciudad del nivel 4). "contentHeight" recorta
        // esa base y, si "alignBottom" está activo, apoya el contenido en el
        // borde inferior de la vista.
        if (contentHeight !== null) {
          const altoVisible = contentHeight * bg.tileScaleY
          bg.setSize(fondoAncho, altoVisible)
          if (alignBottom) {
            bg.y = fondoY + offsetY + fondoAlto - altoVisible
          }
        }

        bg.tilePositionY = tileOffsetY
        bg.setScrollFactor(0)
        bg.setDepth(depth)
        return { bg, speed }
      },
    )

    return { elements }
  }

  static update(parallax, scrollX) {
    if (!parallax || !parallax.elements) return
    parallax.elements.forEach(({ bg, speed }) => {
      bg.tilePositionX += (scrollX * speed - bg.tilePositionX) * 0.08
    })
  }
}
