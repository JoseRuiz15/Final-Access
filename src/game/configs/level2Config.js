export const LEVEL2_CONFIG = {
  vidasIniciales: 4,
  hud: {
    tiempoInicial: 240,
    enemigosObjetivo: 4,
    llavesObjetivo: 2,
    pista: 'Consigue una llave dorada con efecto azul y una llave plateada con efecto rojo',
  },
  assets: {
    tilemaps: [['level2', '/maps/Mapa_level_2.json']],
    images: [
      ['parallax2', '/img/maps/layer2-mapa2.webp'],
      ['parallax3', '/img/maps/layer3-mapa2.webp'],
      ['parallax4', '/img/maps/layer4-mapa2.webp'],
      ['parallax5', '/img/maps/layer5-mapa2.webp'],
      ['ground', '/tiles/ground.png'],
      ['groundBack', '/tiles/groundBack.png'],
      ['pinchos', '/tiles/pinchos.png'],
      ['redDoor', '/img/door/redDoor.png'],
      ['greenDoor', '/img/door/greenDoor.png'],
      ['box', '/tiles/box.png'],
    ],
    spritesheets: [
      [
        'key4Gold',
        '/img/keys-animation/Key 4 - GOLD - Spritesheet.png',
        { frameWidth: 14, frameHeight: 27 },
      ],
      ['key10', '/img/keys-animation/key10.png', { frameWidth: 10, frameHeight: 27 }],
      ['crateBreak', '/img/box/crateBreak.png', { frameWidth: 32, frameHeight: 32 }],
    ],
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
    { x: 1000, y: 560, texture: 'enemyDron', tipo: 'dron', vida: 30, velocidad: 60, limiteIzquierdo: 850, limiteDerecho: 1150, rangoDeteccion: 320, dano: 20 },
  ],

  boxes: [
    { x: 566, y: 752 },
    { x: 600, y: 752 },
    { x: 684, y: 400, keyData: { texture: 'key15Silver', grupo: 'keys', color: 'silver', efecto: 'ninguno', correcta: false } },
    { x: 717, y: 367, keyData: { texture: 'key4Gold', grupo: 'keys', color: 'gold', efecto: 'ninguno', correcta: false } },
    { x: 717, y: 400 },
    { x: 750, y: 400, keyData: { texture: 'key10', grupo: 'keys', color: 'gold', efecto: 'ninguno', correcta: true } },
    { x: 900, y: 657, keyData: { texture: 'key4Silver', grupo: 'keys', color: 'silver', efecto: 'ninguno', correcta: true } },
    { x: 1500, y: 752, keyData: { texture: 'key11Gold', grupo: 'keys', color: 'gold', efecto: 'ninguno', correcta: false } },
  ],

  player: { x: 230, y: 600 },

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
