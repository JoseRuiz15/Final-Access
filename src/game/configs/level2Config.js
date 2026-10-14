export const LEVEL2_CONFIG = {
  assets: {
    tilemaps: [['level2', '/maps/Mapa_level_2.json']],
    images: [
      ['parallax2', '/img/maps/layer2-mapa2.png'],
      ['parallax3', '/img/maps/layer3-mapa2.png'],
      ['parallax4', '/img/maps/layer4-mapa2.png'],
      ['parallax5', '/img/maps/layer5-mapa2.png'],
      ['ground', '/tiles/ground.png'],
      ['groundBack', '/tiles/groundBack.png'],
      ['pinchos', '/tiles/pinchos.png'],
    ],
    spritesheets: [],
  },

  parallax: [
    { key: 'parallax2', speed: 0.15, depth: -4, offsetY: -80 },
    { key: 'parallax3', speed: 0.25, depth: -3 },
    { key: 'parallax4', speed: 0.4, depth: -2, offsetY: 50 },
    { key: 'parallax5', speed: 0.6, depth: -1 },
  ],

  map: {
    mapKey: 'level2',
    tilesets: [
      { tileKey: 'ground', imgKey: 'ground' },
      { tileKey: 'groundBack', imgKey: 'groundBack' },
      { tileKey: 'pinchos', imgKey: 'pinchos' },
    ],
    layers: [
      { name: 'Ground', collision: true },
      { name: 'Pinchos', collision: false },
      { name: 'MarcoPuerta', collision: false },
    ],
    objectLayers: ['DoorObject', 'PinchosDanger'],
  },

  tutorial: [],

  enemies: [
    { x: 400, y: 650, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 370, limiteDerecho: 600 },
    { x: 1250, y: 650, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 600, limiteDerecho: 1300 },
    { x: 2000, y: 650, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1900, limiteDerecho: 2100 },
  ],

  boxes: [],

  player: { x: 230, y: 600 },

  collisionRules: [
    'PlayerGroundRule',
    'EnemyGroundRule',
    'BoxGroundRule',
    'BoxBoxRule',
    'PlayerBoxRule',
    'KeyGroundRule',
    'ProjectilePlayerRule',
  ],
}
