export const LEVEL2_CONFIG = {
  vidasIniciales: 4,
  hud: {
    tiempoInicial: 240,
    imagenLlave: '/img/keys/Key10-GOLD.png',
    mision: [
      'CONSIGUE LA LLAVE DE',
      'COLOR DORADO PARA',
      'SEGUIR AL SIGUIENTE',
      'NIVEL.',
    ],
  },
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
      ['redDoor', '/img/door/redDoor.png'],
      ['greenDoor', '/img/door/greenDoor.png'],
      ['box', '/tiles/box.png'],
      ['imgRecogerLlave', '/img/instruction/imgRecogerLlave.png'],

    ],
    spritesheets: [
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
  ],

  boxes: [
    {
      x: 800,
      y: 400,
      keyData: {
        texture: 'key10',
        grupo: 'keys',
        color: 'silver',
        efecto: 'ninguno',
        correcta: true,
      },
    },
    {
      x: 500,
      y: 752,
      keyData: {
        texture: 'key4Gold',
        grupo: 'keys',
        color: 'gold',
        efecto: 'ninguno',
        correcta: false,
      },
    },
    {
      x: 2450,
      y: 752,
      keyData: {
        texture: 'key15Gold',
        grupo: 'keys',
        color: 'gold',
        efecto: 'ninguno',
        correcta: false,
      },
    },
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
