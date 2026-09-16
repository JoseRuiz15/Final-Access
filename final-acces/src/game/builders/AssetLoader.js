export default class AssetLoader {

  static COMMON_ASSETS = {
    images: [
      ['player', '/img/character/defaultCharacter.png'],
    ],
    spritesheets: [
      ['playerWalk', '/img/animatics-player/playerWalk.png', { frameWidth: 32, frameHeight: 32 }],
      ['playerJump', '/img/animatics-player/playerJump.png', { frameWidth: 32, frameHeight: 32 }],
      ['playerAttack', '/img/animatics-player/playerAttack.png', { frameWidth: 48, frameHeight: 32 }],
      ['playerDamage', '/img/animatics-player/playerDamage.png', { frameWidth: 32, frameHeight: 32 }],
      ['playerDead', '/img/animatics-player/playerDead.png', { frameWidth: 64, frameHeight: 32 }],
      ['enemyWalk', '/img/animatics-enemy/enemyWalk.png', { frameWidth: 48, frameHeight: 32 }],
      ['enemy2Attack', '/img/animatics-enemy/enemyAttack.png', { frameWidth: 48, frameHeight: 32 }],
      ['explosion', '/img/animatics-enemy/explosion.png', { frameWidth: 48, frameHeight: 32 }],
      ['enemyDamage', '/img/animatics-enemy/enemyDamage.png', { frameWidth: 48, frameHeight: 32 }],
      ['proyectile', '/img/animatics-enemy/enemy2attackeffect.png', { frameWidth: 48, frameHeight: 32 }],
    ],
  }

  static load(scene, config) {
    AssetLoader._loadList(scene, AssetLoader.COMMON_ASSETS)
    AssetLoader._loadList(scene, config)
  }

  static _loadList(scene, { images = [], spritesheets = [], tilemaps = [] }) {
    images.forEach(([key, path]) => scene.load.image(key, path))
    spritesheets.forEach(([key, path, size]) => scene.load.spritesheet(key, path, size))
    tilemaps.forEach(([key, path]) => scene.load.tilemapTiledJSON(key, path))
  }
}
