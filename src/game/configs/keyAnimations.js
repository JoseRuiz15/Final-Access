/**
 * Catálogo de spritesheets de llaves animadas.
 * Medidas y cantidad de frames tomadas de:
 * public/img/keys-animation/SPRITSHEET DE CADA LLAVE.txt
 *
 * Cada textura se anima con la clave `${texture}Spin`.
 */
export const KEY_SPRITESHEETS = [
  {
    texture: 'key2Gold',
    path: '/img/keys-animation/Key 2 - GOLD - Spritesheet.png',
    frameWidth: 10,
    frameHeight: 28,
    frames: 12,
    frameRate: 12,
  },
  {
    texture: 'key4Bronze',
    path: '/img/keys-animation/Key 4 - BRONZE - Spritesheet.png',
    frameWidth: 14,
    frameHeight: 27,
    frames: 5,
    frameRate: 12,
  },
  {
    texture: 'key4Gold',
    path: '/img/keys-animation/Key 4 - GOLD - Spritesheet.png',
    frameWidth: 14,
    frameHeight: 27,
    frames: 5,
    frameRate: 12,
  },
  {
    texture: 'key4Grey',
    path: '/img/keys-animation/Key 4 - GREY - Spritesheet.png',
    frameWidth: 14,
    frameHeight: 27,
    frames: 5,
    frameRate: 12,
  },
  {
    texture: 'key4Silver',
    path: '/img/keys-animation/Key 4 - SILVER - Spritesheet.png',
    frameWidth: 14,
    frameHeight: 27,
    frames: 5,
    frameRate: 12,
  },
  {
    texture: 'key11Bronze',
    path: '/img/keys-animation/Key 11 - BRONZE - Spritesheet.png',
    frameWidth: 11,
    frameHeight: 27,
    frames: 12,
    frameRate: 12,
  },
  {
    texture: 'key11Gold',
    path: '/img/keys-animation/Key 11 - GOLD - Spritesheet.png',
    frameWidth: 11,
    frameHeight: 27,
    frames: 12,
    frameRate: 12,
  },
  {
    texture: 'key11Grey',
    path: '/img/keys-animation/Key 11 - GREY - Spritesheet.png',
    frameWidth: 11,
    frameHeight: 27,
    frames: 12,
    frameRate: 12,
  },
  {
    texture: 'key11Silver',
    path: '/img/keys-animation/Key 11 - SILVER - Spritesheet.png',
    frameWidth: 11,
    frameHeight: 27,
    frames: 12,
    frameRate: 12,
  },
  {
    texture: 'key13',
    path: '/img/keys-animation/key13.png',
    frameWidth: 10,
    frameHeight: 27,
    frames: 25,
    frameRate: 12,
  },
  {
    texture: 'key13Bronze',
    path: '/img/keys-animation/Key 13 - BRONZE - Spritesheet.png',
    frameWidth: 10,
    frameHeight: 27,
    frames: 25,
    frameRate: 12,
  },
  {
    texture: 'key13Grey',
    path: '/img/keys-animation/Key 13 - GREY - Spritesheet.png',
    frameWidth: 10,
    frameHeight: 27,
    frames: 25,
    frameRate: 12,
  },
  {
    texture: 'key13Silver',
    path: '/img/keys-animation/Key 13 - SILVER - Spritesheet.png',
    frameWidth: 10,
    frameHeight: 27,
    frames: 25,
    frameRate: 12,
  },
  {
    texture: 'key15Bronze',
    path: '/img/keys-animation/Key 15 - BRONZE - Spritesheet.png',
    frameWidth: 15,
    frameHeight: 29,
    frames: 48,
    frameRate: 12,
  },
  {
    texture: 'key15Gold',
    path: '/img/keys-animation/Key 15 - GOLD - Spritesheet.png',
    frameWidth: 15,
    frameHeight: 29,
    frames: 48,
    frameRate: 12,
  },
  {
    texture: 'key15Grey',
    path: '/img/keys-animation/Key 15 - GREY - Spritesheet.png',
    frameWidth: 15,
    frameHeight: 29,
    frames: 48,
    frameRate: 12,
  },
  {
    texture: 'key15Silver',
    path: '/img/keys-animation/Key 15 - SILVER - Spritesheet.png',
    frameWidth: 15,
    frameHeight: 29,
    frames: 48,
    frameRate: 12,
  },
]

/**
 * Devuelve la clave de animación asociada a una textura de llave.
 * @param {string} texture
 * @returns {string}
 */
export function getKeyAnimationKey(texture) {
  return `${texture}Spin`
}
