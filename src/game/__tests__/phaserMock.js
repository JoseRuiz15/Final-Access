function createEmitter() {
  const listeners = new Map()

  return {
    on(event, callback) {
      const callbacks = listeners.get(event) || []
      callbacks.push({ callback, once: false })
      listeners.set(event, callbacks)
      return this
    },
    once(event, callback) {
      const callbacks = listeners.get(event) || []
      callbacks.push({ callback, once: true })
      listeners.set(event, callbacks)
      return this
    },
    emit(event, ...args) {
      const callbacks = listeners.get(event) || []
      for (const listener of callbacks) listener.callback(...args)
      listeners.set(event, callbacks.filter((listener) => !listener.once))
      return this
    },
  }
}

export class FakeArcadeSprite {
  constructor(scene, x, y, texture) {
    this.scene = scene
    this.x = x
    this.y = y
    this.texture = { key: texture }
    this.frame = { realWidth: 48 }
    this.originX = 0.5
    this.originY = 0.5
    this.flipX = false
    this.active = true
    this.visible = true
    this.scaleX = 1
    this.scaleY = 1
    this.anims = { currentAnim: null, isPlaying: false, stop() { this.isPlaying = false } }
    this._events = createEmitter()

    this.body = {
      enable: true,
      debugShowBody: false,
      debugBodyColor: 0,
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      blocked: { left: false, right: false, down: false },
      touching: { down: false },
      grounded: false,
      setCollideWorldBounds: () => this.body,
      setSize: (width, height) => {
        this.body.size = { width, height }
        return this.body
      },
      setOffset: (offsetX, offsetY) => {
        this.body.offset = { x: offsetX, y: offsetY }
        return this.body
      },
      onFloor: () => this.body.grounded,
      updateFromGameObject: () => {},
      stop: () => {
        this.body.velocity.x = 0
        this.body.velocity.y = 0
      },
    }

    Object.defineProperties(this.body, {
      center: { get: () => ({ x: this.x, y: this.y }) },
      bottom: { get: () => this.y + 15 },
      left: { get: () => this.x - 11 },
      right: { get: () => this.x + 11 },
    })
  }

  setDisplaySize(width, height) {
    this.displayWidth = width
    this.displayHeight = height
    return this
  }

  setDepth(depth) {
    this.depth = depth
    return this
  }

  setScale(x, y = x) {
    this.scaleX = x
    this.scaleY = y
    return this
  }

  setCollideWorldBounds(value) {
    this.collideWorldBounds = value
    return this
  }

  setVelocity(x, y = 0) {
    this.body.velocity.x = x
    this.body.velocity.y = y
    return this
  }

  setVelocityX(x) {
    this.body.velocity.x = x
    return this
  }

  setVelocityY(y) {
    this.body.velocity.y = y
    return this
  }

  setFlipX(value) {
    this.flipX = value
    return this
  }

  setPosition(x, y) {
    this.x = x
    this.y = y
    return this
  }

  setTexture(texture) {
    this.texture = { key: texture }
    return this
  }

  setOrigin(x, y = x) {
    this.originX = x
    this.originY = y
    return this
  }

  setFrame(frame) {
    this.frame = { realWidth: 48, name: frame }
    return this
  }

  setActive(value) {
    this.active = value
    return this
  }

  setVisible(value) {
    this.visible = value
    return this
  }

  play(key) {
    this.anims.currentAnim = { key }
    this.anims.isPlaying = true
    return this
  }

  on(event, callback) {
    this._events.on(event, callback)
    return this
  }

  once(event, callback) {
    this._events.once(event, callback)
    return this
  }

  emit(event, ...args) {
    this._events.emit(event, ...args)
    return this
  }

  destroy() {
    this.active = false
    this.emit('destroy')
    return this
  }
}

class FakeScene {
  constructor(key) {
    this.key = key
    this.events = createEmitter()
    this.scene = { pause() {}, resume() {} }
  }
}

const Phaser = {
  Physics: { Arcade: { Sprite: FakeArcadeSprite } },
  Scene: FakeScene,
  Math: {
    Clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    Distance: {
      Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    },
  },
}

export default Phaser
