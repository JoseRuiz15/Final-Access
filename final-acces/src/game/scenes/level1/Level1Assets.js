/**
 * Clase encargada de cargar todos los assets del Level 1.
 * Separa la responsabilidad de "qué imagenes/texturas cargar" del resto de la escena.
 */
export default class Level1Assets {

  constructor() {
    this.images = [];
    this.spritesheets = [];
    this.tilemaps = [];
  }

  preload(scene) {
    // --- FONDO PARALLAX ---
    scene.load.image('parallax', '/img/maps/layer1-map1.png')
    scene.load.image('parallax2', '/img/maps/layer2-map1.png')
    scene.load.image('parallax3', '/img/maps/layer3-map1.png')
    scene.load.image('parallax4', '/img/maps/layer4-map1.png')
    scene.load.image('parallax5', '/img/maps/layer5-map1.png')

    // --- MAPA Y TILESETS ---
    scene.load.tilemapTiledJSON('level1', '/maps/Mapa_level_1.json')
    scene.load.image('ground', '/tiles/ground.png')
    scene.load.image('decorations', '/tiles/decorations.png')
    scene.load.image('box', '/tiles/box.png')
    scene.load.image('walls', '/tiles/walls.png')

    // --- TUTORIAL ---
    scene.load.image('imgSaltar', '/img/instruction/imgSaltar.png')
    scene.load.image('imgDerecha', '/img/instruction/imgDerecha.png')
    scene.load.image('imgIzquierda', '/img/instruction/imgIzquierda.png')
    scene.load.image('imgAtacar', '/img/instruction/imgAtacar.png')
    scene.load.image('imgInsertarLlave', '/img/instruction/imgInsertarLlave.png')

    // --- CAJAS ---
    scene.load.spritesheet('crateBreak', '/img/box/crateBreak.png', { frameWidth: 32, frameHeight: 32 })

    // --- LLAVES ---
    scene.load.image('key1', '/img/keys/Key1-SILVER.png')
    scene.load.image('imgRecogerLlave', '/img/instruction/imgRecogerLlave.png')
    scene.load.spritesheet('key2', '/img/keys-animation/Key2-SILVER.png', { frameWidth: 10, frameHeight: 28 })
    scene.load.spritesheet('key6', '/img/keys-animation/Key6-SILVER.png', { frameWidth: 16, frameHeight: 35 })

    // --- PUERTA ---
    scene.load.image('greenDoor', '/img/door/greenDoor.png')
    scene.load.image('redDoor', '/img/door/redDoor.png')

    // --- JUGADOR ---
    scene.load.image('player', '/img/character/defaultCharacter.png')
    scene.load.spritesheet('playerWalk', '/img/animatics-player/playerWalk.png', { frameWidth: 32, frameHeight: 32 })
    scene.load.spritesheet('playerJump', '/img/animatics-player/playerJump.png', { frameWidth: 32, frameHeight: 32 })
    scene.load.spritesheet('playerAttack', '/img/animatics-player/playerAttack.png', { frameWidth: 48, frameHeight: 32 })
    scene.load.spritesheet('playerDamage', '/img/animatics-player/playerDamage.png', { frameWidth: 32, frameHeight: 32 })
    scene.load.spritesheet('playerDead', '/img/animatics-player/playerDead.png', { frameWidth: 64, frameHeight: 32 })

    // --- ENEMIGO ---
    scene.load.spritesheet('enemyWalk', '/img/animatics-enemy/enemyWalk.png', { frameWidth: 48, frameHeight: 32 })
    scene.load.spritesheet('enemy2Attack', '/img/animatics-enemy/enemyAttack.png', { frameWidth: 48, frameHeight: 32 })
    scene.load.spritesheet('explosion', '/img/animatics-enemy/explosion.png', { frameWidth: 48, frameHeight: 32 })
    scene.load.spritesheet('enemyDamage', '/img/animatics-enemy/enemyDamage.png', { frameWidth: 48, frameHeight: 32 })
    scene.load.spritesheet('proyectile', '/img/animatics-enemy/enemy2attackeffect.png', { frameWidth: 48, frameHeight: 32 })
  }

  // Método opcional para obtener la lista de keys cargadas
  get loadedKeys() {
    return this.images.concat(this.spritesheets.map(s => s.key));
  }
}