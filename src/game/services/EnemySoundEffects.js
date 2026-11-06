const ENEMY_SOUND_EFFECTS = Object.freeze({
  enemyescarabajo: {
    shot: {
      key: 'enemy-beetle-shot',
      path: '/soundEffects/Enemigo/enemyescarabajo/disparo/shotEnemyEscarabajo.mp3',
    },
    explosion: {
      key: 'enemy-beetle-explosion',
      path: '/soundEffects/Enemigo/enemyescarabajo/explosion/explosionEnemyEscarabajo.mp3',
    },
  },
  enemyDron: {
    shot: {
      key: 'enemy-drone-shot',
      path: '/soundEffects/Enemigo/enemyDron/disparo/shotEnemyDron.mp3',
    },
    explosion: {
      key: 'enemy-drone-explosion',
      path: '/soundEffects/Enemigo/enemyDron/explosion/explosionEnemyDron.mp3',
    },
  },
  enemytrap: {
    shot: {
      key: 'enemy-trap-shot',
      path: '/soundEffects/Enemigo/enemytrap/disparo/shotEnemyTrap.mp3',
    },
  },
})

export function loadEnemySoundEffects(scene, enemyConfigs = [], enemyTrapConfigs = []) {
  const profiles = new Set(
    enemyConfigs.map(({ tipo }) => (tipo === 'dron' ? 'enemyDron' : 'enemyescarabajo')),
  )
  if (enemyTrapConfigs.length) profiles.add('enemytrap')

  profiles.forEach((profile) => {
    Object.values(ENEMY_SOUND_EFFECTS[profile] ?? {}).forEach(({ key, path }) => {
      scene.load.audio(key, path)
    })
  })
}

export function playEnemySoundEffect(scene, profile, effect) {
  const sound = ENEMY_SOUND_EFFECTS[profile]?.[effect]
  if (!sound || !scene?.sound || !scene.cache?.audio?.exists(sound.key)) return

  scene.sound.play(sound.key, { volume: 0.7 })
}
