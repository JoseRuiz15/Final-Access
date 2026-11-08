export const LEVEL6_CONFIG = {
  vidasIniciales: 3,
  zoom: 0.8,

  hud: {
    tiempoInicial: 240,
    mostrarEnemigos: true,
    enemigosObjetivo: 6,
    llavesObjetivo: 2,
    pista: 'Encuentra las dos llaves necesarias para abrir la puerta.',
  },

  assets: {
    tilemaps: [['level6', '/maps/Mapa_level_6_Multiplayer.json']],

    images: [
      ['map6Layer1', '/img/maps/map6_layer1.png'],
      ['map6Layer2', '/img/maps/map6_layer2.png'],
      ['map6Layer3', '/img/maps/map6_layer3.png'],
      ['ground', '/tiles/ground.png'],
      ['groundBack', '/tiles/groundBack.png'],
      ['pinchos', '/tiles/pinchos.png'],
      ['box', '/tiles/box.png'],
      ['redDoor', '/img/door/redDoor.png'],
      ['greenDoor', '/img/door/greenDoor.png'],
    ],

    spritesheets: [['crateBreak', '/img/box/crateBreak.png', { frameWidth: 32, frameHeight: 32 }]],
  },

  parallax: [
    { key: 'map6Layer1', speed: 0.10, depth: -5, offsetY: -200},
    { key: 'map6Layer2', speed: 0.20, depth: -4,},
    { key: 'map6Layer3', speed: 0.30, depth: -3, setScale: 1, offsetY: 100},
  ],

  map: {
    mapKey: 'level6',
    tilesets: [
      { tileKey: 'ground', imgKey: 'ground' },
      { tileKey: 'groundBack', imgKey: 'groundBack' },
      { tileKey: 'pinchos', imgKey: 'pinchos' },
      // El atlas ground2 de Tiled no está en public/tiles; se reutiliza el atlas urbano disponible.
      { tileKey: 'ground2', imgKey: 'pinchos' },
    ],
    layers: [
      { name: 'Door', collision: false },
      { name: 'Pinchos', collision: false },
      { name: 'MovingPlatformTiles', collision: false },
      { name: 'Ground', collision: true },
    ],
    objectLayers: ['DoorObject', 'PinchosDanger', 'MovingPlatforms'],
  },

  tutorial: [],

  enemies: [
    { x: 750, y: 736, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 600, limiteDerecho: 1000 },
    { x: 1000, y: 736, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 600, limiteDerecho: 1000 },
    { x: 880, y: 416, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 780, limiteDerecho: 950 },
    { x: 1790, y: 608, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1600, limiteDerecho: 1940 },
    { x: 1550, y: 608, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1600, limiteDerecho: 1940 },
    {
      x: 2300,
      y: 480,
      texture: 'enemyDron',
      tipo: 'dron',
      vida: 30,
      velocidad: 60,
      limiteIzquierdo: 2120,
      limiteDerecho: 2440,
      rangoDeteccion: 320,
      dano: 20,
    },
    { x: 3240, y: 416, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 3200, limiteDerecho: 3290 },
  ],

  boxes: [
    { x: 140, y: 752 },
    { x: 800, y: 432, keyData: { texture: 'key6Silver', grupo: 'keys', color: 'silver', correcta:false } },
    { x: 830, y: 432 },
    { x: 815, y: 400 },
    { x: 1700, y: 625, keyData: { texture: 'key4Grey', grupo: 'keys', color: 'grey', correcta: true } },
    { x: 1733, y: 625, keyData: { texture: 'key11Grey', grupo: 'keys', color: 'grey', correcta:false } },
    { x: 1856, y: 624 },
    { x: 3216, y: 432 },
    { x: 3450, y: 432 },
  ],

  player: { x: 150, y: 736 },

  collisionRules: [
    'PlayerGroundRule',
    'EnemyGroundRule',
    'BoxGroundRule',
    'BoxBoxRule',
    'PlayerBoxRule',
    'KeyGroundRule',
    'ProjectilePlayerRule',
    'PlayerSpikesRule',
    'MovingPlatformRule',
  ],
}

export default LEVEL6_CONFIG
