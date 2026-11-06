const PLAYER_SOUND_EFFECTS = Object.freeze({
  walk: {
    key: 'player-walk',
    path: '/soundEffects/Jugador/walk.mp3',
  },
  hurt: {
    key: 'player-hurt',
    path: '/soundEffects/Jugador/hurt.mp3',
  },
  brokenBox: {
    key: 'box-broken',
    path: '/soundEffects/Jugador/brokenBox.mp3',
  },
  getKey: {
    key: 'player-get-key',
    path: '/soundEffects/Jugador/getKey.mp3',
  },
  dropKey: {
    key: 'player-drop-key',
    path: '/soundEffects/Jugador/dropKey.mp3',
  },
  jump: {
    key: 'player-jump',
    path: '/soundEffects/Jugador/jumpPlayer.mp3',
  },
  lifeLost: {
    key: 'player-life-lost',
    path: '/soundEffects/Jugador/loseLife.mp3',
  },
  gameOver: {
    key: 'player-game-over',
    path: '/soundEffects/Jugador/gameOver.mp3',
  },
  respawn: {
    key: 'player-respawn',
    path: '/soundEffects/Jugador/respawn.mp3',
  },
})

const COSA3_SOUND_EFFECTS = Object.freeze({
  cosa3NormalShot: {
    key: 'cosa3-normal-shot',
    path: '/soundEffects/Jugador/verde/disparo/disparoVerde.mp3',
  },
  cosa3Charge: {
    key: 'cosa3-charge',
    path: '/soundEffects/Jugador/verde/disparo/cargaDisparo.mp3',
  },
  cosa3ChargedShot: {
    key: 'cosa3-charged-shot',
    path: '/soundEffects/Jugador/verde/disparo/disparoCargadoVerde.mp3',
  },
})

const COSA1_SOUND_EFFECTS = Object.freeze({
  cosa1Attack: {
    key: 'cosa1-attack',
    path: '/soundEffects/Jugador/rojo/pu%C3%B1osRojo.mp3',
  },
})

export function loadPlayerSoundEffects(scene, characterId) {
  const characterEffects =
    characterId === 'cosa1'
      ? COSA1_SOUND_EFFECTS
      : characterId === 'cosa3'
        ? COSA3_SOUND_EFFECTS
        : {}
  const effects = { ...PLAYER_SOUND_EFFECTS, ...characterEffects }

  Object.values(effects).forEach(({ key, path }) => {
    scene.load.audio(key, path)
  })
}

export function playPlayerSoundEffect(scene, effect) {
  const sound =
    PLAYER_SOUND_EFFECTS[effect] ??
    COSA1_SOUND_EFFECTS[effect] ??
    COSA3_SOUND_EFFECTS[effect]
  if (!sound || !scene?.sound || !scene.cache?.audio?.exists(sound.key)) return

  scene.sound.play(sound.key, { volume: 0.7 })
}

export function createPlayerSoundLoop(scene, effect) {
  const sound = PLAYER_SOUND_EFFECTS[effect]
  if (!sound || !scene?.sound?.add || !scene.cache?.audio?.exists(sound.key)) return null

  return scene.sound.add(sound.key, { volume: 0.7, loop: true })
}
