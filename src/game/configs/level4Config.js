export const LEVEL4_CONFIG = {
  vidasIniciales: 3,

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
    ],
  },

  parallax: [
    { key: 'map3Layer1', speed: 0.08, depth: -5 },
    { key: 'map3Layer2', speed: 0.15, depth: -4 },
    { key: 'map3Layer3', speed: 0.25, depth: -3 },
    { key: 'map3Layer4', speed: 0.4, depth: -2 },
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

  // Todavía sin enemigos ni cajas: se agregarán más adelante.
  enemies: [],
  boxes: [],

  player: { x: 80, y: 736 },

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
