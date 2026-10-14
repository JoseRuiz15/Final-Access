export default class AnimationRegistry {
  registerAll(scene, characterConfig = null) {

    // Comunes: solo una vez
    if (!scene.anims.exists('enemyWalk')) {
      this._registerCommon(scene)
    }

    // Jugador “default” (cosa1) — lo que ya tenías
    if (!scene.anims.exists('caminar')) {
      this._registerPlayerDefault(scene)
    }

    // Personaje seleccionado con anims propias (cosa2, …)
    if (characterConfig?.animFrames) {
      this._registerFromCharacter(scene, characterConfig)
    }

    if (characterConfig?.spritesheets?.length) {
      this._registerFromCharacter(scene, characterConfig)
    }
  }

  _registerPlayerDefault(scene){

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
      key: 'playerDead',
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
    }

    _registerCommon(scene) {
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

  /* _registerFromCharacter(scene, characterConfig) {
    //const animKeys = characterConfig.anims || {}
    const ranges = characterConfig.animFrames || {}

    Object.entries(ranges).forEach(([logicName, def]) => {
      const key = animKeys[logicName] || def.sheet
      if (!key || scene.anims.exists(key)) return

      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(def.sheet, {
          start: def.start,
          end: def.end,
        }),
        frameRate: def.frameRate,
        repeat: def.repeat,
      })
    })
  } */

    _registerFromCharacter(scene, characterConfig) {
      const ranges = characterConfig.animFrames || {}
      if (!ranges || !Object.keys(ranges).length) return

      // Mapa: nombre que usa el Player → entrada en animFrames
      const logical = {
        caminar: ranges.walk,
        saltar: ranges.jump,
        atacar: ranges.attack,
        playerDamage: ranges.damage,
        playerDead: ranges.dead,
  }

  Object.entries(logical).forEach(([key, def]) => {
    if (!def) return
    // Si ya existe (cosa1), la sobrescribimos solo si este personaje la necesita
    if (scene.anims.exists(key)) {
      scene.anims.remove(key)
    }
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(def.sheet, {
        start: def.start,
        end: def.end,
      }),
      frameRate: def.frameRate,
      repeat: def.repeat,
    })
  })
}
    
}
