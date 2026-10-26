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
        walk:   { sheet: 'character2Walk',   start: 0, end: 7, frameRate: 10, repeat: -1 },
        // Mantiene la animación activa durante caídas largas; se cambia al aterrizar.
        jump:   { sheet: 'character2Jump',   start: 0, end: 6, frameRate: 3,  repeat: -1 },
        jumpAttack: { sheet: 'character2JumpAttack', start: 0, end: 6, frameRate: 18, repeat: 0 },
        attack: { sheet: 'character2Attack1', start: 0, end: 21, frameRate: 18, repeat: 0 },
        damage: { sheet: 'character2Damage', start: 0, end: 5, frameRate: 12, repeat: 0 },
        dead:   { sheet: 'character2Dead',   start: 0, end: 5, frameRate: 12, repeat: 0 },
    },
    // Aquí defines qué hay que cargar para este personaje
    spritesheets: [
      ['character2Walk', '/img/animatics-player/character2Walk.png', { frameWidth: 32, frameHeight: 32 }],
      ['character2Jump', '/img/animatics-player/character2Jump.png', { frameWidth: 32, frameHeight: 48 }],
      ['character2JumpAttack', '/img/animatics-player/character2JumpAttack.png', { frameWidth: 48, frameHeight: 48 }],
      ['character2Attack1', '/img/animatics-player/character2Attack1.png', { frameWidth: 64, frameHeight: 32 }],
      ['character2Damage', '/img/animatics-player/character2Damage.png', { frameWidth: 32, frameHeight: 32 }],
      ['character2Dead', '/img/animatics-player/character2Dead.png', { frameWidth: 64, frameHeight: 32 }],
    ],
    images: [
      ['cosa2', '/img/character/character2.png'],
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
        // Mantiene el salto visible durante caídas largas, igual que en Cosa 2.
        jump:   { sheet: 'character3Jump',   start: 0, end: 6, frameRate: 3,  repeat: -1 },
        projectile: { sheet: 'character3Projectile', start: 0, end: 2, frameRate: 12, repeat: -1 },
        chargeEffect: { sheet: 'character3ChargeEffect', start: 0, end: 12, frameRate: 12, repeat: 0 },
        chargedProjectile: { sheet: 'character3ChargedBullet', start: 0, end: 5, frameRate: 12, repeat: -1 },
        jumpAttack: { sheet: 'character3JumpAttack', start: 0, end: 6, frameRate: 7, repeat: 0 },
        // Ataque en movimiento: hoja de 8 frames.
        attack: { sheet: 'character3RunAttack', start: 0, end: 7, frameRate: 18, repeat: 0 },
        // Ataque quieto: hoja de 3 frames.
        attackIdle: { sheet: 'character3Attack', start: 0, end: 2, frameRate: 6, repeat: 0 },
        // Fogonazo del ataque tap: hoja de 5 frames.
        attackEffect: { sheet: 'character3AttackEffect', start: 0, end: 4, frameRate: 20, repeat: 0 },
        damage: { sheet: 'character3Damage', start: 0, end: 5, frameRate: 12, repeat: 0 },
        dead:   { sheet: 'character3Dead',   start: 0, end: 5, frameRate: 12, repeat: 0 },
    },
    // Aquí defines qué hay que cargar para este personaje
    spritesheets: [
      ['character3Walk', '/img/animatics-player/character3Walk.png', { frameWidth: 32, frameHeight: 32 }],
      ['character3Jump', '/img/animatics-player/character3Jump.png', { frameWidth: 32, frameHeight: 48 }],
      ['character3JumpAttack', '/img/animatics-player/character3JumpAttack.png', { frameWidth: 32, frameHeight: 48 }],
      ['character3Projectile', '/img/animatics-player/shootAttacksEffect.png', { frameWidth: 32, frameHeight: 32 }],
      ['character3ChargeEffect', '/img/animatics-player/character3cChargeEffect.png', { frameWidth: 32, frameHeight: 32 }],
      ['character3ChargedBullet', '/img/animatics-player/chargedBullet.png', { frameWidth: 32, frameHeight: 32 }],
      ['character3RunAttack', '/img/animatics-player/character3RunAttack.png', { frameWidth: 32, frameHeight: 32 }],
      ['character3Attack', '/img/animatics-player/character3Attack.png', { frameWidth: 32, frameHeight: 32 }],
      ['character3AttackEffect', '/img/animatics-player/character3AttackEffect.png', { frameWidth: 32, frameHeight: 32 }],
      ['character3Damage', '/img/animatics-player/character3Damage.png', { frameWidth: 32, frameHeight: 32 }],
      ['character3Dead', '/img/animatics-player/character3Death.png', { frameWidth: 64, frameHeight: 32 }],
    ],
    images: [
      ['cosa3', '/img/character/charcter3.png'],
      ['character3Bullet', '/img/animatics-player/bullet.png'],
    ],
  }


}

export function getCharacter(id) {
  return CHARACTERS[id] ?? CHARACTERS.cosa1
}

export function getAllCharacters() {
  return Object.values(CHARACTERS)
}
