import Phaser from 'phaser'

export default class PatrolAI {
  constructor(enemy, config = {}) {
    this.enemy = enemy
    this.velocidad = config.velocidad || 50
    this.limiteIzquierdo = config.limiteIzquierdo || 670
    this.limiteDerecho = config.limiteDerecho || 1100
    this.direccion = 1

    this.rangoDeteccion = config.rangoDeteccion ?? 120
    this.rangoAtaque = config.rangoAtaque ?? 100
    this.margenPersecucionX = config.margenPersecucionX ?? 8
    // Evita que el enemigo camine más allá del suelo que lo sostiene.
    this.evitarCaidas = config.evitarCaidas ?? true
    this.margenBorde = config.margenBorde ?? 6
  }

  update() {
    if (
      this.enemy.muerto ||
      this.enemy.recibiendoDano ||
      this.enemy.atacando ||
      this.enemy.aiming
    ) {
      this.enemy.setVelocity(0)
      return
    }

    if (!this.enemy.target || !this.enemy.target.active) {
      // console.warn('Enemy sin target válido:', this.enemy.target)
      this.patrol()
      return
    }

    const distancia = Phaser.Math.Distance.Between(
      this.enemy.x,
      this.enemy.y,
      this.enemy.target.x,
      this.enemy.target.y,
    )
    // Si el jugador sale del rango de detección → vuelve a patrullar.
    if (distancia > this.rangoDeteccion) {
      this.patrol()
      return
    }

    // Dispara si corresponde, pero sin detener la persecución. La altura
    // la valida el propio enemigo.
    if (distancia <= this.rangoAtaque) {
      this.enemy.atacar()
    }

    // Persigue hasta quedar justo debajo/al lado del jugador, incluso si
    // está sobre una plataforma.
    if (Math.abs(this.enemy.target.x - this.enemy.x) <= this.margenPersecucionX) {
      this.enemy.setVelocityX(0)
      this.enemy.setFlipX(this.enemy.target.x < this.enemy.x)
      this._detenerAnimacion()
      return
    }

    this.chase()
  }

  _detenerAnimacion() {
    if (
      this.enemy.animWalk &&
      this.enemy.anims.isPlaying &&
      this.enemy.anims.currentAnim?.key === this.enemy.animWalk
    ) {
      this.enemy.anims.stop()
      this.enemy.setFrame(0)
    }
  }

  patrol() {
    // Gira antes de avanzar si llegó a un límite, a una pared o al borde
    // de la plataforma.
    if (this._debeGirar(this.direccion)) {
      this.direccion *= -1
    }

    // Sin salida por ninguno de los dos lados: se queda quieto en el borde.
    if (!this._puedeAvanzar(this.direccion)) {
      this.enemy.setVelocityX(0)
      this._detenerAnimacion()
      return
    }

    this.enemy.setVelocityX(this.velocidad * this.direccion)
    this.enemy.setFlipX(this.direccion === 1)
    if (!this.enemy.anims.isPlaying && this.enemy.animWalk) {
      this.enemy.play(this.enemy.animWalk, true)
    }
  }

  chase() {
    const dir = this.enemy.target.x < this.enemy.x ? -1 : 1
    this.direccion = dir
    this.enemy.setFlipX(dir === 1)

    // Si delante hay un hueco, se detiene en el borde mirando al jugador.
    // Cuando el jugador se mueva a una zona alcanzable, volverá a seguirlo.
    if (this._bordeFisicoDelante(dir)) {
      this.enemy.setVelocityX(0)
      this._detenerAnimacion()
      return
    }

    this.enemy.setVelocityX(this.velocidad * this.direccion)
    if (!this.enemy.anims.isPlaying && this.enemy.animWalk) {
      this.enemy.play(this.enemy.animWalk, true)
    }
  }

  _debeGirar(dir) {
    if (dir < 0) {
      if (this.enemy.x <= this.limiteIzquierdo) return true
      if (this.enemy.body.blocked.left) return true
    } else {
      if (this.enemy.x >= this.limiteDerecho) return true
      if (this.enemy.body.blocked.right) return true
    }

    return this._bordeFisicoDelante(dir)
  }

  _puedeAvanzar(dir) {
    if (dir < 0 && this.enemy.x <= this.limiteIzquierdo) return false
    if (dir > 0 && this.enemy.x >= this.limiteDerecho) return false

    return !this._bordeFisicoDelante(dir)
  }

  _bordeFisicoDelante(dir) {
    if (!this.evitarCaidas) return false

    const { body, scene } = this.enemy
    const ground = scene?.mapResult?.layers?.Ground
    if (!ground || !body) return false

    // Solo aplica cuando el enemigo está apoyado en el suelo. Los enemigos
    // voladores, como el dron, no deben comprobar huecos.
    if (!body.blocked.down && !body.touching.down) return false

    const bordeX = dir < 0 ? body.left : body.right
    const x = bordeX + dir * this.margenBorde
    const y = body.bottom + 4
    const tile = ground.getTileAtWorldXY(x, y, false)

    return !tile || tile.index === -1
  }
}
