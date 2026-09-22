export default class AnimationRegistry {
  registerAll(scene) {
    if (scene.anims.exists('caminar')) return

    scene.anims.create({
      key: 'caminar',
      frames: scene.anims.generateFrameNumbers('playerWalk', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    })
    scene.anims.create({
      key: 'saltar',
      frames: scene.anims.generateFrameNumbers('playerJump', { start: 0, end: 6 }),
      frameRate: 3,
      repeat: 0,
    })
    scene.anims.create({
      key: 'atacar',
      frames: scene.anims.generateFrameNumbers('playerAttack', { start: 0, end: 12 }),
      frameRate: 18,
      repeat: 0,
    })
    scene.anims.create({
      key: 'playerDie',
      frames: scene.anims.generateFrameNumbers('playerDead', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0,
    })
    scene.anims.create({
      key: 'playerDamage',
      frames: scene.anims.generateFrameNumbers('playerDamage', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0,
    })

    scene.anims.create({
      key: 'enemyWalk',
      frames: scene.anims.generateFrameNumbers('enemyWalk', { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1,
    })
    scene.anims.create({
      key: 'enemyAttack',
      frames: scene.anims.generateFrameNumbers('enemy2Attack', { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1,
    })
    scene.anims.create({
      key: 'enemyDamage',
      frames: scene.anims.generateFrameNumbers('enemyDamage', { start: 0, end: 4 }),
      frameRate: 12,
      repeat: 0,
    })

    scene.anims.create({
      key: 'enemyDie',
      frames: scene.anims.generateFrameNumbers('enemyDamage', { start: 0, end: 4 }),
      frameRate: 12,
      repeat: 0,
    })

    scene.anims.create({
      key: 'explosion',
      frames: scene.anims.generateFrameNumbers('explosion', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: 0,
    })
    scene.anims.create({
      key: 'key2Spin',
      frames: scene.anims.generateFrameNumbers('key2', { start: 0, end: 11 }),
      frameRate: 12,
      repeat: -1,
    })
    scene.anims.create({
      key: 'proyectile',
      frames: scene.anims.generateFrameNumbers('proyectile', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    })
  }
}
