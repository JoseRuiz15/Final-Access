export default class MapBuilder {

  static create(scene, config, physicsService) {
    const { mapKey, tilesets, layers, objectLayers = [] } = config

    const map = scene.make.tilemap({ key: mapKey })
    const tiles = tilesets.map(({ tileKey, imgKey }) => map.addTilesetImage(tileKey, imgKey))

    const createdLayers = {}
    layers.forEach(({ name, collision }) => {
      const layer = map.createLayer(name, tiles)
      if (collision) layer.setCollisionByExclusion([-1])
      createdLayers[name] = layer
    })

    const objectLayerResults = {}
    objectLayers.forEach((layerName) => {
      objectLayerResults[layerName] = map.getObjectLayer(layerName)
    })

    scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    if (physicsService) {
      physicsService.setBounds(map.widthInPixels, map.heightInPixels)
    }

    return { map, layers: createdLayers, objectLayers: objectLayerResults }
  }
}
