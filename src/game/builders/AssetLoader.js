export default class AssetLoader {
  static COMMON_ASSETS = {
    images: [['player', '/img/character/defaultCharacter.png']],
    spritesheets: [
      ['playerWalk', '/img/animatics-player/playerWalk.png', { frameWidth: 32, frameHeight: 32 }],
      ['playerJump', '/img/animatics-player/playerJump.png', { frameWidth: 32, frameHeight: 32 }],
      [
        'playerAttack',
        '/img/animatics-player/playerAttack.png',
        { frameWidth: 48, frameHeight: 32 },
      ],
      [
        'playerDamage',
        '/img/animatics-player/playerDamage.png',
        { frameWidth: 32, frameHeight: 32 },
      ],
      ['playerDead', '/img/animatics-player/playerDead.png', { frameWidth: 64, frameHeight: 32 }],
/* 
      ['character2Walk', '/img/animatics-player/character2Walk', { frameWidth: 32, frameHeight: 32 }],
      ['character2Jump', '/img/animatics-player/character2Jump', { frameWidth: 32, frameHeight: 32 }],
      ['character2JumpAttack', '/img/animatics-player/character2JumpAttack', { frameWidth: 32, frameHeight: 32 }],
      ['character2Attack1', '/img/animatics-player/character2Attack1', { frameWidth: 48, frameHeight: 32 }],
      ['character2Damage', '/img/animatics-player/character2Damage', { frameWidth: 32, frameHeight: 32 }],
      ['character2Dead', '/img/animatics-player/character2Dead', { frameWidth: 64, frameHeight: 32 }],

      ['character3Walk', '/img/animatics-player/character3Walk', { frameWidth: 32, frameHeight: 32 }],
      ['character3Jump', '/img/animatics-player/character3Jump', { frameWidth: 32, frameHeight: 32 }],
      ['character3JumpAttack', '/img/animatics-player/character3JumpAttack', { frameWidth: 32, frameHeight: 32 }],
      ['character3Attack', '/img/animatics-player/character3RunAttack', { frameWidth: 32, frameHeight: 32 }],
      ['character3Damage', '/img/animatics-player/character3Damage', { frameWidth: 32, frameHeight: 32 }],
      ['character3Dead', '/img/animatics-player/character3Dead', { frameWidth: 64, frameHeight: 32 }],

 */
      ['enemyWalk', '/img/animatics-enemy/enemyWalk.png', { frameWidth: 48, frameHeight: 32 }],
      ['enemy2Attack', '/img/animatics-enemy/enemyAttack.png', { frameWidth: 48, frameHeight: 32 }],
      ['explosion', '/img/animatics-enemy/explosion.png', { frameWidth: 48, frameHeight: 32 }],
      ['enemyDamage', '/img/animatics-enemy/enemyDamage.png', { frameWidth: 48, frameHeight: 32 }],
      [
        'proyectile',
        '/img/animatics-enemy/enemy2attackeffect.png',
        { frameWidth: 48, frameHeight: 32 },
      ],
    ],
  }

  static load(scene, config, characterConfig = null) {
    AssetLoader._loadList(scene, AssetLoader.COMMON_ASSETS)
    AssetLoader._loadList(scene, config)
    if (characterConfig) {
      AssetLoader._loadList(scene, {
        images: characterConfig.images || [],
        spritesheets: characterConfig.spritesheets || [],
      })
    }
  }

  static _loadList(scene, { images = [], spritesheets = [], tilemaps = [] }) {
    images.forEach(([key, path]) => scene.load.image(key, path))
    spritesheets.forEach(([key, path, size]) => scene.load.spritesheet(key, path, size))
    tilemaps.forEach(([key, path]) => scene.load.tilemapTiledJSON(key, path))
  }
}
