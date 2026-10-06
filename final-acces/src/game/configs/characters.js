export const CHARACTERS = {
    cosa1: {
        id: 'cosa1',
        name: 'cosa 1',
        texture: 'player',
        walkTexture: 'playerWalk',
        attackType: 'melee',
        stats: {
            vida: 100,
            velocidad: 160,
            daño: 20,
        },
        anims: {
            walk: 'caminar',
            jump: 'saltar',
            attack: 'atacar',
            damage: 'playerDamage',
            dead: 'playerDead',
        }
    },

    cosa2: {
    id: 'cosa2',
    name: 'Cosa 2',
    texture: 'cosa2',    // textura idle propia
    attackType: 'rangedCharged',
    stats: { vida: 80, velocidad: 140, daño: 15 },
    animFrames: {
        walk:   { sheet: 'character2Walk.png',   start: 0, end: 7, frameRate: 10, repeat: -1 },
        jump:   { sheet: 'character2Jump.png',   start: 0, end: 6, frameRate: 3,  repeat: 0 },
        jumpAttack: { sheet: 'character2JumpAttack.png', start: 0, end: 6, frameRate: 3, repeat: 0 },
        attack: { sheet: 'character2Attack1.png', start: 0, end: 12, frameRate: 18, repeat: 0 },
        damage: { sheet: 'character2Damage.png', start: 0, end: 5, frameRate: 12, repeat: 0 },
        dead:   { sheet: 'character2Dead.png',   start: 0, end: 5, frameRate: 12, repeat: 0 },
    },
    // Aquí defines qué hay que cargar para este personaje
    spritesheets: [
      ['character2Walk', '/img/animatics-player/character2Walk', { frameWidth: 32, frameHeight: 32 }],
      ['character2Jump', '/img/animatics-player/character2Jump', { frameWidth: 32, frameHeight: 32 }],
      ['character2JumpAttack', '/img/animatics-player/character2JumpAttack', { frameWidth: 48, frameHeight: 32 }],
      ['character2Attack1', '/img/animatics-player/character2Attack1', { frameWidth: 48, frameHeight: 32 }],
      ['character2Damage', '/img/animatics-player/character2Damage', { frameWidth: 32, frameHeight: 32 }],
      ['character2Dead', '/img/animatics-player/character2Dead', { frameWidth: 64, frameHeight: 32 }],
    ],
    images: [
      ['cosa2', '/img/character/cosa2.png'],
    ],
  },
  
  cosa3: {
    id: 'cosa3',
    name: 'Cosa 3',
    texture: 'cosa3',            // textura idle propia
    attackType: 'rangedCharged',
    stats: { vida: 80, velocidad: 140, daño: 15 },
    animFrames: {
        walk:   { sheet: 'character3Walk',   start: 0, end: 7, frameRate: 10, repeat: -1 },
        jump:   { sheet: 'character3Jump',   start: 0, end: 6, frameRate: 3,  repeat: 0 },
        attack: { sheet: 'character3Attack', start: 0, end: 12, frameRate: 18, repeat: 0 },
        damage: { sheet: 'character3Damage', start: 0, end: 5, frameRate: 12, repeat: 0 },
        dead:   { sheet: 'character3Dead',   start: 0, end: 5, frameRate: 12, repeat: 0 },
    },
    // Aquí defines qué hay que cargar para este personaje
    spritesheets: [
      ['character3Walk', '/img/animatics-player/character3Walk', { frameWidth: 32, frameHeight: 32 }],
      ['character3Jump', '/img/animatics-player/character3Jump', { frameWidth: 32, frameHeight: 32 }],
      ['character3JumpAttack', '/img/animatics-player/character3JumpAttack', { frameWidth: 48, frameHeight: 32 }],
      ['character3Attack', '/img/animatics-player/character3RunAttack', { frameWidth: 48, frameHeight: 32 }],
      ['character3Damage', '/img/animatics-player/character3Damage', { frameWidth: 32, frameHeight: 32 }],
      ['character3Dead', '/img/animatics-player/character3Dead', { frameWidth: 64, frameHeight: 32 }],
    ],
    images: [
      ['cosa3', '/img/character/cosa3.png'],
    ],
  }


}

export function getCharacter(id) {
  return CHARACTERS[id] ?? CHARACTERS.cosa1
}

export function getAllCharacters() {
  return Object.values(CHARACTERS)
}