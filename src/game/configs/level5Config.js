export const LEVEL5_CONFIG = {
  vidasIniciales: 3,
  // 720 / 0.8 = 900 px. El mapa mide 960 px de alto, igual que el nivel 4.
  zoom: 0.8,

  hud: {
    tiempoInicial: 240,
    mostrarEnemigos: true,
    enemigosObjetivo: 8,
    llavesObjetivo: 3,
    pista: 'Consigue tres llaves: una dorada grande y dos plateadas de distinto tamaño.',
  },

  checkpoint: {
    triggerX: 1530,
    spawnX: 1540,
    spawnY: 690,
  },

  assets: {
    tilemaps: [['level5', '/maps/Mapa_level_5.json']],

    images: [
      // Fondo rojo de la ciudad para el nivel 5.
      ['map5Layer1', '/img/maps/map5-Layer1.png'],
      ['map5Layer2', '/img/maps/map5-Layer2.png'],
      ['map5Layer3', '/img/maps/map5-Layer3.png'],
      ['map5Layer4', '/img/maps/map5-layer4.png'],

      ['ground', '/tiles/ground.png'],
      ['groundBack', '/tiles/groundBack.png'],
      ['pinchos', '/tiles/pinchos.png'],
      ['box', '/tiles/box.png'],
      ['redDoor', '/img/door/redDoor.png'],
      ['greenDoor', '/img/door/greenDoor.png'],
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

  // Usa el mismo patrón de parallax que el nivel 4 (mismo estilo de ciudad, 4 capas).
  parallax: [
    { key: 'map5Layer1', speed: 0.08, depth: -5, tileScale: { x: 1, y: 1.2 } },
    { key: 'map5Layer2', speed: 0.15, depth: -4, tileScale: { x: 1, y: 1.2 }, offsetY: -50 },
    { key: 'map5Layer3', speed: 0.25, depth: -3, tileScale: { x: 1, y: 1.2 }, offsetY: 110 },
    { key: 'map5Layer4', speed: 0.4, depth: -2, tileScale: { x: 1, y: 1.2 } },
  ],

  map: {
    mapKey: 'level5',
    tilesets: [
      { tileKey: 'ground', imgKey: 'ground' },
      { tileKey: 'groundBack', imgKey: 'groundBack' },
      { tileKey: 'pinchos', imgKey: 'pinchos' },
    ],
    layers: [
      { name: 'Door', collision: false },
      { name: 'Ground', collision: true },
      // El manager copia estos tiles y crea el visual móvil.
      { name: 'MovingPlatformTiles', collision: false },
    ],
    objectLayers: ['DoorObject', 'MovingPlatforms'],
  },

  tutorial: [],

  enemies: [
    // Plataforma inicial.
    { x: 250, y: 740, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 82, limiteDerecho: 240, rangoDeteccion: 260 },
    { x: 60, y: 740, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 82, limiteDerecho: 240, rangoDeteccion: 260 },
    // Plataforma alta de la primera sección.
    { x: 600, y: 230, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 490, limiteDerecho: 726, rangoDeteccion: 320 },
    // Plataforma superior de la zona central.
    { x: 1700, y: 300, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1548, limiteDerecho: 1844, rangoDeteccion: 300 },
    // Plataforma inferior de la zona central.
    { x: 1650, y: 650, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1520, limiteDerecho: 1860, rangoDeteccion: 300 },
    // Plataforma de la puerta final.
    { x: 4000, y: 610, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 3890, limiteDerecho: 4110, rangoDeteccion: 300 },
    // Drones que vigilan los saltos entre plataformas.
  ],

  enemyTraps: [
    // Zona inicial.
    { x: 530, y: 320, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 610, y: 320, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 690, y: 320, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    // Zona central.
    { x: 1570, y: 480, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 1650, y: 480, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 1745, y: 480, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    { x: 1820, y: 480, detectionRange: 280, attackCooldown: 1200, damage: 20 },
    // Zona final.
    { x: 4040, y: 630, detectionRange: 280, attackCooldown: 1200, damage: 20 },
  ],

  plataformasCaedizas: ['plataforma3', 'plataforma4', 'plataforma5', 'plataforma6', 'plataforma8'],
  retrasoCaida: 3000,

  boxes: [
    { x: 560, y: 272, keyData: { texture: 'key15Gold', grupo: 'keys', color: 'gold', efecto: 'ninguno', correcta: true } },
    { x: 1600, y: 688, keyData: { texture: 'key15Silver', grupo: 'keys', color: 'silver', efecto: 'ninguno', correcta: true } },
    { x: 3900, y: 656, keyData: { texture: 'key13Silver', grupo: 'keys', color: 'silver', efecto: 'ninguno', correcta: true } },
    { x: 1760, y: 688, keyData: { texture: 'key15Bronze', grupo: 'keys', color: 'bronze', efecto: 'ninguno', correcta: false } },
    { x: 120, y: 784, keyData: { texture: 'key15Grey', grupo: 'keys', color: 'grey', efecto: 'ninguno', correcta: false } },
    { x: 680, y: 272, keyData: { texture: 'key13Bronze', grupo: 'keys', color: 'bronze', efecto: 'ninguno', correcta: false } },
    { x: 4100, y: 656, keyData: { texture: 'key11Silver', grupo: 'keys', color: 'silver', efecto: 'ninguno', correcta: false } },
    { x: 180, y: 784, keyData: { texture: 'key4Gold', grupo: 'keys', color: 'gold', efecto: 'ninguno', correcta: false } },
    { x: 520, y: 272 },
    { x: 1700, y: 688 },
    { x: 1840, y: 688 },
  ],

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

export default LEVEL5_CONFIG
