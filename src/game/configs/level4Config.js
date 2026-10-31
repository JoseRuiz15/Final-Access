export const LEVEL4_CONFIG = {
  vidasIniciales: 3,
  // 720 / 0.8 = 900 px, la altura completa del mapa en Tiled.
  zoom: 0.8,

  hud: {
    tiempoInicial: 240,
    // El nivel todavía no tiene llaves; cuando se agreguen, basta con poner
    // aquí la imagen y el HUD volverá a mostrar la sección de llaves.
    imagenLlave: null,
    mostrarEnemigos: false,
    enemigosObjetivo: 0,
    mision: ['CRUZA LAS PLATAFORMAS', 'MÓVILES Y LLEGA', 'HASTA LA PUERTA', 'DEL FINAL.'],
  },

  assets: {
    tilemaps: [['level4', '/maps/Mapa_level_4.json']],

    images: [
      // Fondo de ciudad dorada para el nivel 4.
      ['map3Layer1', '/img/maps/map3-layer1.png'],
      ['map3Layer2', '/img/maps/map3-layer2.png'],
      ['map3Layer3', '/img/maps/map3-layer3.png'],
      ['map3Layer4', '/img/maps/map3-layer4.png'],

      ['ground', '/tiles/ground.png'],
      ['groundBack', '/tiles/groundBack.png'],
      ['pinchos', '/tiles/pinchos.png'],
      ['redDoor', '/img/door/redDoor.png'],
      ['greenDoor', '/img/door/greenDoor.png'],
      ['imgRecogerLlave', '/img/instruction/imgRecogerLlave.png'],
      ['enemyTrap', '/img/animatics-enemy/enemyTrap.png'],
      ['enemyBulletTrap', '/img/animatics-enemy/enemyBulletTrap.png'],
    ],

    spritesheets: [
      ['crateBreak', '/img/box/crateBreak.png', { frameWidth: 32, frameHeight: 32 }],
      [
        'enemyTrapAnimation',
        '/img/animatics-enemy/enemyTrapAnimation.png',
        { frameWidth: 32, frameHeight: 32 },
      ],
    ],
  },

  // Usa el mismo encuadre y movimiento de parallax que los niveles 1 y 3.
  parallax: [
    { key: 'map3Layer1', speed: 0.08, depth: -5 },
    { key: 'map3Layer2', speed: 0.15, depth: -4, tileScale: { x: 1, y: 1.2 } },
    { key: 'map3Layer3', speed: 0.25, depth: -3, tileScale: { x: 1, y: 1.2 }, offsetY: 110 },
    { key: 'map3Layer4', speed: 0.4, depth: -2, tileScale: { x: 1, y: 1.2 }, offsetY: 150 },
  ],

  map: {
    mapKey: 'level4',
    tilesets: [
      { tileKey: 'ground', imgKey: 'ground' },
      { tileKey: 'groundBack', imgKey: 'groundBack' },
      { tileKey: 'pinchos', imgKey: 'pinchos' },
    ],
    layers: [
      { name: 'Door', collision: false },
      { name: 'Ground', collision: true },
      { name: 'Pinchos', collision: false },
      // El manager copia estos tiles y crea el visual móvil.
      { name: 'MovingPlatformTiles', collision: false },
    ],
    objectLayers: ['DoorObject', 'PinchosDanger', 'MovingPlatforms'],
  },

  tutorial: [],

 
  enemies: [
    { x: 800, y: 700, texture: 'enemyWalk', vida: 20, rangoDeteccion: 400,  rangoAtaque: 400,},
    { x: 1030, y: 400, texture: 'enemyWalk', vida: 20, rangoDeteccion: 400,  rangoAtaque: 400},
    { x: 1000, y: 800, texture: 'enemyWalk', vida: 20, rangoDeteccion: 800,  rangoAtaque: 800},
    { x: 1500, y: 580, texture: 'enemyDron', tipo: 'dron', vida: 30, velocidad: 60, limiteIzquierdo: 1150, limiteDerecho: 1800, rangoDeteccion: 320, dano: 20}
  ],

  enemyTraps: [
    { x: 738, y: 515, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 1075, y: 640, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 915, y: 640, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 2258, y: 417, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 2354, y: 417, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    
  ],

  boxes: [],

 
  player: { x: 150, y: 500 },

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
