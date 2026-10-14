export const LEVEL1_CONFIG = {
  assets: {
    tilemaps: [['level1', '/maps/Mapa_level_1.json']],
    images: [
      ['parallax', '/img/maps/layer1-map1.png'],
      ['parallax2', '/img/maps/layer2-map1.png'],
      ['parallax3', '/img/maps/layer3-map1.png'],
      ['parallax4', '/img/maps/layer4-map1.png'],
      ['parallax5', '/img/maps/layer5-map1.png'],
      ['ground', '/tiles/ground.png'],
      ['decorations', '/tiles/decorations.png'],
      ['box', '/tiles/box.png'],
      ['walls', '/tiles/walls.png'],
      ['imgSaltar', '/img/instruction/imgSaltar.png'],
      ['imgDerecha', '/img/instruction/imgDerecha.png'],
      ['imgIzquierda', '/img/instruction/imgIzquierda.png'],
      ['imgAtacar', '/img/instruction/imgAtacar.png'],
      ['imgInsertarLlave', '/img/instruction/imgInsertarLlave.png'],
      ['key1', '/img/keys/Key1-SILVER.png'],
      ['imgRecogerLlave', '/img/instruction/imgRecogerLlave.png'],
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

  tutorial: [
    { key: 'imgSaltar', x: 530, y: 800, scale: 0.25 },
    { key: 'imgDerecha', x: 300, y: 600, scale: 0.25 },
    { key: 'imgIzquierda', x: 150, y: 600, scale: 0.25 },
    { key: 'imgAtacar', x: 700, y: 650, scale: 0.25 },
    { key: 'imgInsertarLlave', x: 1600, y: 500, scale: 0.25 },
  ],

  enemies: [
    { x: 700, y: 650, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 670, limiteDerecho: 1100 },
    { x: 1100, y: 550, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 670, limiteDerecho: 1100 },
    { x: 1500, y: 650, texture: 'enemyWalk', vida: 20, limiteIzquierdo: 1600, limiteDerecho: 2100 },
  ],

  boxes: [
    {
      x: 780,
      y: 435,
      keyData: {
        texture: 'key2',
        grupo: 'keys',
        color: 'silver',
        efecto: 'ninguno',
        correcta: true,
      },
    },
    { x: 812, y: 435 },
    { x: 844, y: 435 },
    { x: 812, y: 403 },
    { x: 920, y: 660 },
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
  ],
}
