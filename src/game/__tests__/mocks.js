export const createMockScene = () => ({
  add: {
    existing: () => {},
    sprite: () => ({
      play: () => {},
      on: () => {},
      once: () => {},
      setPosition: () => {},
      setDepth: () => {},
      setVisible: () => {},
      setScale: () => {},
    }),
    group: () => ({ add: () => {}, getChildren: () => [] }),
    image: () => ({
      setTexture: () => {},
      setPosition: () => {},
      setDepth: () => {},
      setScale: () => {},
      setVisible: () => {},
    }),
  },
  physics: {
    add: {
      existing: () => {},
      collider: () => {},
      overlap: () => {},
      group: () => ({ add: () => {}, getChildren: () => [] }),
    },
    world: { setBounds: () => {} },
  },
  cameras: {
    main: {
      startFollow: () => {},
      setZoom: () => {},
      setBounds: () => {},
      setViewport: () => {},
      scrollX: 0,
    },
  },
  scale: { width: 1280, height: 720 },
  time: { delayedCall: (_, cb) => cb() },
  anims: {
    exists: () => false,
    create: () => {},
    generateFrameNumbers: () => [],
  },
  input: {
    keyboard: {
      addKeys: () => ({
        A: { isDown: false },
        D: { isDown: false },
        SPACE: { isDown: false },
        W: { isDown: false },
        L: { isDown: false },
        G: { isDown: false },
      }),
    },
  },
  registry: { set: () => {} },
})

export const createMockPhysicsBody = () => ({
  setCollideWorldBounds: () => {},
  setAllowGravity: () => {},
  setVelocity: () => {},
  setVelocityX: () => {},
  setVelocityY: () => {},
  blocked: { down: true, left: false, right: false },
  enable: true,
})

export const createMockSprite = (overrides = {}) => ({
  x: 0,
  y: 0,
  setDisplaySize: () => {},
  setScale: () => {},
  setCollideWorldBounds: () => {},
  setBounce: () => {},
  setFrame: () => {},
  setImmovable: () => {},
  setVelocity: () => {},
  setVelocityX: () => {},
  setVelocityY: () => {},
  setFlipX: () => {},
  setTexture: () => {},
  play: () => {},
  on: () => {},
  once: () => {},
  destroy: () => {},
  anims: { isPlaying: false, currentAnim: { key: '' } },
  body: createMockPhysicsBody(),
  active: true,
  visible: true,
  texture: { key: 'test' },
  ...overrides,
})
