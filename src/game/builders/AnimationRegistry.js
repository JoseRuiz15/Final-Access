import { getKeyAnimationKey, KEY_SPRITESHEETS } from '../configs/keyAnimations.js'

export default class AnimationRegistry {
  registerAll(scene, characterConfig = null) {

    // Llaves animadas: se registran siempre (assets comunes).
    this._registerKeys(scene)

    // Comunes: solo una vez
    if (!scene.anims.exists('enemyWalk')) {
      this._registerCommon(scene)
    }

    // Dron: se registra sólo cuando sus texturas están cargadas.
    this._registerDrone(scene)

    // Jugador “default” (cosa1) — lo que ya tenías
    if (!scene.anims.exists('caminar')) {
      this._registerPlayerDefault(scene)
    }

    // Personaje seleccionado con anims propias (cosa2, …)
    if (characterConfig?.animFrames) {
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

    _registerKeys(scene) {
    KEY_SPRITESHEETS.forEach(({ texture, frames, frameRate = 12 }) => {
      const animationKey = getKeyAnimationKey(texture)

      if (scene.anims.exists(animationKey)) return

      scene.anims.create({
        key: animationKey,
        frames: scene.anims.generateFrameNumbers(texture, { start: 0, end: frames - 1 }),
        frameRate,
        repeat: -1,
      })
    })

    // Estas llaves se cargan en la configuración de su nivel (key2 en el 1,
    // key10 en el 2), así que aquí solo se animan cuando la textura existe.
    const levelKeys = [
      { texture: 'key2', frames: 12 },
      { texture: 'key10', frames: 25 },
    ]

    levelKeys.forEach(({ texture, frames }) => {
      const animationKey = getKeyAnimationKey(texture)
      if (scene.anims.exists(animationKey) || !scene.textures.exists(texture)) return

      scene.anims.create({
        key: animationKey,
        frames: scene.anims.generateFrameNumbers(texture, { start: 0, end: frames - 1 }),
        frameRate: 12,
        repeat: -1,
      })
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
      repeat: 0,
    })
    scene.anims.create({
      key: 'enemyDamage',
      frames: scene.anims.generateFrameNumbers('enemyDamage', { start: 0, end: 4 }),
      frameRate: 18,
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
      frames: scene.anims.generateFrameNumbers('explosion', { start: 0, end: 8 }),
      frameRate: 8,
      repeat: 0,
    })
    // Fogonazo del escarabajo: los 10 frames se reproducen una sola vez y
    // el sprite se oculta al terminar.
    scene.anims.create({
      key: 'enemy2AttackEffect',
      frames: scene.anims.generateFrameNumbers('enemy2AttackEffect', { start: 0, end: 9 }),
      frameRate: 14,
      repeat: 0,
    })
  }

  _registerDrone(scene) {
    const animations = [
      { key: 'enemyDronWalk', texture: 'enemyDron', end: 2, frameRate: 1, repeat: -1 },
      { key: 'enemyDronFire', texture: 'enemyDronFlyingEffect', end: 1, frameRate: 12, repeat: -1 },
      { key: 'enemyDronAttack', texture: 'enemyDronAttack', end: 5, frameRate: 12, repeat: 0 },
      { key: 'enemyDronDead', texture: 'enemyDronDead', end: 2, frameRate: 8, repeat: 0 },
    ]

    animations.forEach(({ key, texture, end, frameRate, repeat }) => {
      if (!scene.textures.exists(texture) || scene.anims.exists(key)) return

      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(texture, { start: 0, end }),
        frameRate,
        repeat,
      })
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
        atacarQuieto: ranges.attackIdle,
        atacarAereo: ranges.jumpAttack,
        cosa3AttackEffect: ranges.attackEffect,
        cosa3Projectile: ranges.projectile,
        cosa3ChargeEffect: ranges.chargeEffect,
        cosa3ChargedProjectile: ranges.chargedProjectile,
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
