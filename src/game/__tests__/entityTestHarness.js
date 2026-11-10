function createEmitter() {
  const listeners = new Map()
  return {
    on(event, callback) {
      const callbacks = listeners.get(event) || []
      callbacks.push(callback)
      listeners.set(event, callbacks)
    },
    once(event, callback) {
      const onceCallback = (...args) => {
        listeners.set(
          event,
          (listeners.get(event) || []).filter((listener) => listener !== onceCallback),
        )
        callback(...args)
      }
      this.on(event, onceCallback)
    },
    emit(event, ...args) {
      for (const callback of listeners.get(event) || []) callback(...args)
    },
  }
}

export function createScene() {
  return {
    config: { vidasIniciales: 5 },
    events: createEmitter(),
    time: {
      now: 1000,
      scheduledCalls: [],
      delayedCall(delay, callback) {
        this.scheduledCalls.push({ delay, callback })
        return { remove() {} }
      },
    },
    add: {
      existing() {},
      sprite() {
        return { setScale() {}, setDepth() {}, setVisible() {}, on() {}, destroy() {} }
      },
    },
    physics: { add: { existing() {} } },
    textures: { exists: () => false },
    anims: { exists: () => false },
    mapResult: null,
    isMultiplayerLevel: false,
    onPlayerDeath() {},
    mostrarExplosion() {},
  }
}

export function createRepository() {
  return {
    vidas: 5,
    llaves: 0,
    llavesCorrectas: 0,
    enemigos: 0,
    dashUnlocked: false,
    incrementarEnemigos() {
      this.enemigos += 1
    },
  }
}
