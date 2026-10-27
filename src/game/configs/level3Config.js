export const LEVEL3_CONFIG = {
  vidasIniciales: 3,

  hud: {
    tiempoInicial: 180,
    imagenLlave: '/img/keys/Key13-SILVER.png',
    mision: [
      'CONSIGUE LA LLAVE',
      'PLATEADA, ABRE LA',
      'PUERTA Y ESCAPA',
      'DE LA CIUDAD.',
    ],
    enemigosObjetivo: 9,
  },

  assets: {
    tilemaps: [['level3', '/maps/Mapa_level_3.json']],

    images: [
      // Mismo fondo azul del nivel 1
      ['parallax', '/img/maps/layer1-map1.webp'],
      ['parallax2', '/img/maps/layer2-map1.png'],
      ['parallax3', '/img/maps/layer3-map1.webp'],
      ['parallax4', '/img/maps/layer4-map1.webp'],
      ['parallax5', '/img/maps/layer5-map1.webp'],

      ['ground', '/tiles/ground.png'],
      ['groundBack', '/tiles/groundBack.png'],
      ['pinchos', '/tiles/pinchos.png'],
      ['box', '/tiles/box.png'],
      ['redDoor', '/img/door/redDoor.png'],
      ['greenDoor', '/img/door/greenDoor.png'],
      ['imgRecogerLlave', '/img/instruction/imgRecogerLlave.png'],
    ],

    spritesheets: [
      ['crateBreak', '/img/box/crateBreak.png', { frameWidth: 32, frameHeight: 32 }],
    ],
  },

  // Exactamente el mismo parallax del nivel 1
  parallax: [
    { key: 'parallax', speed: 0.08, depth: -5 },
    { key: 'parallax2', speed: 0.15, depth: -4 },
    { key: 'parallax3', speed: 0.25, depth: -3 },
    { key: 'parallax4', speed: 0.4, depth: -2, offsetY: 110 },
    { key: 'parallax5', speed: 0.6, depth: -1, offsetY: 100 },
  ],

  map: {
    mapKey: 'level3',
    tilesets: [
      { tileKey: 'ground', imgKey: 'ground' },
      // El mapa conserva el nombre "grounback" (sin la "d") de Tiled.
      { tileKey: 'grounback', imgKey: 'groundBack' },
      { tileKey: 'pinchos', imgKey: 'pinchos' },
    ],
    layers: [
      { name: 'Door', collision: false },
      { name: 'Ground', collision: true },
      { name: 'Pinchos', collision: false },
    ],
    objectLayers: ['DoorObject', 'PinchosDanger'],
  },

  tutorial: [],

  enemies: [
    { x: 850, y: 800, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 760, limiteDerecho: 1050 },
    { x: 1200, y: 700, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1100, limiteDerecho: 1350 },
    { x: 1470, y: 640, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1440, limiteDerecho: 1620 },
    { x: 2350, y: 640, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 2300, limiteDerecho: 2430 },
    { x: 2700, y: 700, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 2656, limiteDerecho: 2848 },
    { x: 3350, y: 700, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 3230, limiteDerecho: 3480 },
    {
      x: 1100,
      y: 520,
      texture: 'enemyDron',
      tipo: 'dron',
      vida: 30,
      velocidad: 60,
      limiteIzquierdo: 950,
      limiteDerecho: 1250,
      rangoDeteccion: 320,
      dano: 20,
    },
    {
      x: 2300,
      y: 500,
      texture: 'enemyDron',
      tipo: 'dron',
      vida: 30,
      velocidad: 60,
      limiteIzquierdo: 2150,
      limiteDerecho: 2450,
      rangoDeteccion: 320,
      dano: 20,
    },
    {
      x: 3200,
      y: 540,
      texture: 'enemyDron',
      tipo: 'dron',
      vida: 30,
      velocidad: 60,
      limiteIzquierdo: 3050,
      limiteDerecho: 3350,
      rangoDeteccion: 320,
      dano: 20,
    },
  ],

  boxes: [
    {
      x: 1550,
      y: 688,
      keyData: {
        texture: 'key13',
        grupo: 'keys',
        color: 'silver',
        efecto: 'ninguno',
        correcta: true,
      },
    },
    { x: 1000, y: 880 },
    { x: 1620, y: 688 },
  ],

  player: { x: 230, y: 740 },

  collisionRules: [
    'PlayerGroundRule',
    'EnemyGroundRule',
    'BoxGroundRule',
    'BoxBoxRule',
    'PlayerBoxRule',
    'KeyGroundRule',
    'ProjectilePlayerRule',
    'PlayerSpikesRule',
  ],
}
