/**
 * Manager de plataformas móviles - SRP
 * Lee los rectángulos de la capa MovingPlatforms y los tiles visuales de
 * MovingPlatformTiles. Cada rectángulo representa la posición inicial.
 *
 * Propiedades esperadas en Tiled:
 * - velocidad: píxeles por segundo
 * - recorrido: tiles que avanza desde la posición inicial
 * - direccion: "derecha" o "izquierda"
 *
 * Plataformas caedivas (opt-in desde la escena):
 * - config.plataformasCaedizas: array con los nombres de plataforma que caen
 * - config.retrasoCaida: ms que espera tras pisarla antes de caer (default 3000)
 *
 * Estados de una plataforma caediva:
 *   normal   → se mueve como cualquier plataforma móvil
 *   temblando → el jugador la pisó; aviso visual durante retrasoCaida
 *   cayendo   → se desactiva el movimiento horizontal, cae con gravedad
 *   destruida → salió del mapa; cuerpo desactivado y visual oculto
 */
export default class MovingPlatformManager {
  constructor() {
    this.scene = null
    this.platforms = []
    this.plataformasCaedizas = []
    this.retrasoCaida = 3000
    this._initialized = false
  }

  init(scene) {
    if (this._initialized) return
    this.scene = scene
    this._initialized = true
  }

  _ensureInit() {
    if (!this._initialized) {
      throw new Error('MovingPlatformManager not initialized. Call init(scene) first.')
    }
  }

  create(mapResult, config = {}) {
    this._ensureInit()
    this.platforms = []
    this.plataformasCaedizas = config.plataformasCaedizas || []
    this.retrasoCaida = config.retrasoCaida ?? 3000

    const objectLayer = mapResult?.objectLayers?.MovingPlatforms
    const tileLayer = mapResult?.layers?.MovingPlatformTiles
    if (!objectLayer?.objects?.length || !tileLayer) return this.platforms

    const tileWidth = mapResult.map.tileWidth
    const tileHeight = mapResult.map.tileHeight

    objectLayer.objects.forEach((object, index) => {
      const platform = this._createPlatform(object, index, tileLayer, tileWidth, tileHeight)
      if (platform) this.platforms.push(platform)
    })

    return this.platforms
  }

  _createPlatform(object, index, tileLayer, tileWidth, tileHeight) {
    const properties = this._readProperties(object)
    const left = Math.round(object.x / tileWidth) * tileWidth
    const top = Math.round(object.y / tileHeight) * tileHeight
    const width = Math.max(tileWidth, Math.round(object.width / tileWidth) * tileWidth)
    const height = Math.max(tileHeight, Math.round(object.height / tileHeight) * tileHeight)

    const startTileX = Math.round(left / tileWidth)
    const startTileY = Math.round(top / tileHeight)
    const tilesX = Math.max(1, Math.round(width / tileWidth))
    const tilesY = Math.max(1, Math.round(height / tileHeight))

    const centerX = left + width / 2
    const centerY = top + height / 2
    const visual = this.scene.add.container(centerX, centerY)
    visual.setDepth(0)

    let copiedTiles = 0

    for (let tileY = startTileY; tileY < startTileY + tilesY; tileY++) {
      for (let tileX = startTileX; tileX < startTileX + tilesX; tileX++) {
        const tile = tileLayer.getTileAt(tileX, tileY)
        if (!tile) continue

        const textureKey = tile.tileset?.image || tile.tileset?.name
        if (!textureKey) continue

        const frameName = this._getTileFrame(textureKey, tile)
        if (!frameName) continue

        const image = this.scene.add.image(
          tileX * tileWidth + tileWidth / 2 - centerX,
          tileY * tileHeight + tileHeight / 2 - centerY,
          textureKey,
          frameName,
        )
        image.setFlipX(Boolean(tile.flipX))
        image.setFlipY(Boolean(tile.flipY))
        visual.add(image)
        copiedTiles++
      }
    }

    if (copiedTiles === 0) {
      visual.destroy()
      console.warn(
        `MovingPlatformManager: ${object.name || 'plataforma'} no tiene tiles visuales debajo.`,
      )
      return null
    }

    // Los tiles originales ya están representados por el contenedor móvil.
    for (let tileY = startTileY; tileY < startTileY + tilesY; tileY++) {
      for (let tileX = startTileX; tileX < startTileX + tilesX; tileX++) {
        tileLayer.removeTileAt(tileX, tileY)
      }
    }

    // El cuerpo es invisible; el contenedor es el dibujo que lo sigue.
    const bodyObject = this.scene.add.rectangle(centerX, centerY, width, height, 0x000000, 0)
    bodyObject.setVisible(false)
    this.scene.physics.add.existing(bodyObject)

    const body = bodyObject.body
    body.setAllowGravity(false)
    body.setImmovable(true)
    body.setFriction(1, 0)
    body.setSize(width, height)

    const rawSpeed = Number(properties.velocidad ?? 60)
    const speed = Number.isFinite(rawSpeed) ? Math.abs(rawSpeed) : 60
    const travelTiles = Math.max(0, Math.round(Number(properties.recorrido ?? 0) || 0))
    const travel = travelTiles * tileWidth
    const direction = properties.direccion === 'izquierda' ? -1 : 1
    const minLeft = direction === 1 ? left : left - travel
    const maxLeft = direction === 1 ? left + travel : left

    body.setVelocityX(direction * speed)

    const esCaediza = this.plataformasCaedizas.includes(object.name)

    return {
      name: object.name || `plataforma${index + 1}`,
      bodyObject,
      visual,
      speed,
      travel,
      left,
      minLeft,
      maxLeft,
      width,
      height,
      caediza: esCaediza,
      estado: esCaediza ? 'normal' : null,
      xInicial: body.x,
      yInicial: body.y,
      velocidadXInicial: body.velocity.x,
      tiempoInicioTemblor: null,
    }
  }

  _getTileFrame(textureKey, tile) {
    const texture = this.scene.textures.get(textureKey)
    if (!texture) return null

    const frameName = `tile-${tile.tileset.name}-${tile.index}`
    if (texture.has(frameName)) return frameName

    const coordinates = tile.tileset.getTileTextureCoordinates(tile.index)
    if (!coordinates) return null

    texture.add(
      frameName,
      0,
      coordinates.x,
      coordinates.y,
      tile.tileset.tileWidth,
      tile.tileset.tileHeight,
    )

    return frameName
  }

  _readProperties(object) {
    return (object.properties || []).reduce((result, property) => {
      result[property.name] = property.value
      return result
    }, {})
  }

  update() {
    if (!this.scene || !this.platforms.length) return

    const player = this.scene.player
    const retrasoCaida = this.retrasoCaida
    const ahora = this.scene.time.now
    const mapHeight = this.scene.mapResult?.map?.heightInPixels ?? this.scene.scale.height

    this.platforms.forEach((platform) => {
      const body = platform.bodyObject?.body
      if (!body) return

      // --- Caediza: detectar que el jugador pisa la plataforma ---
      if (
        platform.caediza &&
        platform.estado === 'normal' &&
        player &&
        player.body &&
        player.body.blocked.down &&
        player.body.touching.down &&
        player.x > body.x &&
        player.x < body.x + body.width &&
        player.y < body.y + body.height / 2
      ) {
        platform.estado = 'temblando'
        platform.tiempoInicioTemblor = ahora
      }

      // --- Estado: temblando (aviso visual antes de caer) ---
      if (platform.caediza && platform.estado === 'temblando') {
        const transcurrido = ahora - platform.tiempoInicioTemblor
        const temblorX = Math.sin(ahora / 40) * 3

        // Durante el aviso la plataforma sigue moviéndose normalmente.
        if (platform.travel > 0) {
          if (body.velocity.x < 0 && body.x <= platform.minLeft) {
            body.x = platform.minLeft
            body.updateCenter()
            body.setVelocityX(platform.speed)
          } else if (body.velocity.x > 0 && body.x >= platform.maxLeft) {
            body.x = platform.maxLeft
            body.updateCenter()
            body.setVelocityX(-platform.speed)
          }
        } else {
          body.setVelocityX(0)
        }

        platform.visual.setPosition(body.center.x + temblorX, body.center.y)

        if (transcurrido >= retrasoCaida) {
          platform.estado = 'cayendo'
          body.setAllowGravity(true)
          body.setVelocityY(150)
          body.setVelocityX(0)
          platform.visual.setPosition(body.center.x, body.center.y)
        }
        return
      }

      // --- Estado: cayendo (gravedad hasta salir del mapa) ---
      if (platform.caediza && platform.estado === 'cayendo') {
        platform.visual.setPosition(body.center.x, body.center.y)
        if (body.y > mapHeight + 200) {
          body.enable = false
          platform.estado = 'destruida'
          platform.visual.setVisible(false)
        }
        return
      }

      // --- Estado: destruida (sin movimiento) ---
      if (platform.caediza && platform.estado === 'destruida') return

      // --- Movimiento normal (plataformas no caedivas o caediva en estado normal) ---
      if (!platform.caediza || platform.estado === 'normal') {
        if (platform.travel > 0) {
          if (body.velocity.x < 0 && body.x <= platform.minLeft) {
            body.x = platform.minLeft
            body.updateCenter()
            body.setVelocityX(platform.speed)
          } else if (body.velocity.x > 0 && body.x >= platform.maxLeft) {
            body.x = platform.maxLeft
            body.updateCenter()
            body.setVelocityX(-platform.speed)
          }
        } else {
          body.setVelocityX(0)
        }

        platform.visual.setPosition(body.center.x, body.center.y)
      }
    })
  }

  /** Restaura todas las plataformas caedivas a su estado inicial (se usa al perder una vida). */
  resetCaedizas() {
    this.platforms.forEach((platform) => {
      if (!platform.caediza) return
      const body = platform.bodyObject?.body
      if (!body) return

      body.enable = true
      body.setAllowGravity(false)
      body.setVelocity(0, 0)
      // Restaura la posición inicial del objeto Tiled (borde izquierdo), no del centro del body.
      body.x = platform.left + platform.width / 2
      body.y = platform.top + platform.height / 2
      body.updateCenter()
      body.setVelocityX(platform.velocidadXInicial)

      platform.estado = 'normal'
      platform.tiempoInicioTemblor = null
      platform.visual.setVisible(true)
      platform.visual.setPosition(body.center.x, body.center.y)
    })
  }

  getPlatforms() {
    return this.platforms
  }
}
