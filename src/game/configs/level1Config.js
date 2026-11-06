export const LEVEL1_CONFIG = {
  vidasIniciales: 5,
  hud: {
    tiempoInicial: 300,
    llavesObjetivo: 1,
    pista: 'Consigue una llave plateada con brillo rojo para avanzar de nivel. Solo podras avanzar si recoges e introduces la llave correcta.',
  },
  assets: {
    tilemaps: [['level1', '/maps/Mapa_level_1.json']],
    images: [
      ['parallax', '/img/maps/layer1-map1.webp'],
      ['parallax2', '/img/maps/layer2-map1.png'],
      ['parallax3', '/img/maps/layer3-map1.webp'],
      ['parallax4', '/img/maps/layer4-map1.webp'],
      ['parallax5', '/img/maps/layer5-map1.webp'],
      ['ground', '/tiles/ground.png'],
      ['decorations', '/tiles/decorations.png'],
      ['box', '/tiles/box.png'],
      ['walls', '/tiles/walls.png'],
      ['key1', '/img/keys/Key1-SILVER.png'],
      ['greenDoor', '/img/door/greenDoor.png'],
      ['redDoor', '/img/door/redDoor.png'],
    ],
    spritesheets: [
      ['crateBreak', '/img/box/crateBreak.png', { frameWidth: 32, frameHeight: 32 }],
      ['key2', '/img/keys-animation/Key2-SILVER.png', { frameWidth: 10, frameHeight: 28 }],
      ['key6', '/img/keys-animation/Key6-SILVER.png', { frameWidth: 16, frameHeight: 35 }],
    ],
  },

  parallax: [
    { key: 'parallax', speed: 0.08, depth: -5 },
    { key: 'parallax2', speed: 0.15, depth: -4 },
    { key: 'parallax3', speed: 0.25, depth: -3 },
    { key: 'parallax4', speed: 0.4, depth: -2, offsetY: 110 },
    { key: 'parallax5', speed: 0.6, depth: -1, offsetY: 100 },
  ],

  map: {
    mapKey: 'level1',
    tilesets: [
      { tileKey: 'ground', imgKey: 'ground' },
      { tileKey: 'decorations', imgKey: 'decorations' },
      { tileKey: 'box', imgKey: 'box' },
      { tileKey: 'walls', imgKey: 'walls' },
    ],
    layers: [
      { name: 'BackGround', collision: false },
      { name: 'Walls', collision: true },
      { name: 'Ground', collision: true },
    ],
    objectLayers: ['DoorObjet'],
  },

  // Marcadores DOM separados. x/y indican la esquina superior izquierda en coordenadas del mapa.
  tutorialOverlays: [
    { id: 'movement-wasd', src: '/img/tutorial/teclas_WASD.png', alt: 'Teclas W, A, S y D', label: 'MOVERSE CON W S D', x: 250, y: 650, width: 100 },
    { id: 'movement-arrows', src: '/img/tutorial/teclas_flecha.png', alt: 'Teclas de flecha', label: 'O CON FLECHAS', x: 450, y: 658, width: 100 },
    { id: 'jump-space', src: '/img/tutorial/tecla_espacio.png', alt: 'Tecla Espacio', label: 'SALTAR · W / ↑', x: 640, y: 900, width: 100 },
    { id: 'attack-l', src: '/img/tutorial/tecla_L.png', alt: 'Tecla L', label: 'ATACAR', x: 900, y: 762, width: 30 },
    { id: 'interact-g', src: '/img/tutorial/tecla_G.png', alt: 'Tecla G', label: 'RECOGER LLAVE', x: 840, y: 410, width: 30 },
    { id: 'drop-key', src: '/img/tutorial/tecla_k.png', alt: 'Tecla K', label: 'SOLTAR LLAVE', x: 1150, y: 410, width: 30 },
    { id: 'interact-g', src: '/img/tutorial/tecla_G.png', alt: 'Tecla G', label: 'ABRIR PUERTA', x: 2220, y: 750, width: 30 },
  ],

  enemies: [
    { x: 700, y: 650, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 670, limiteDerecho: 1100 },
    { x: 800, y: 400, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 670, limiteDerecho: 1100 },
    { x: 1900, y: 650, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1600, limiteDerecho: 2100 },
  ],

  boxes: [
    { x: 780, y: 435, keyData: { texture: 'key2', grupo: 'keys', color: 'silver', efecto: 'ninguno', correcta: true } },
    { x: 812, y: 435 },
    { x: 844, y: 435 },
    { x: 812, y: 403 },
    { x: 920, y: 660 },
    { x: 340, y: 752, keyData: { texture: 'key4Bronze', grupo: 'keys', color: 'bronze', efecto: 'ninguno', correcta: false } },
  ],

  player: { x: 200, y: 650 },

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
