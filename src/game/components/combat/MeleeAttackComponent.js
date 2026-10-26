import EntityFactory from '../../factories/EntityFactory.js'

// Tiempo mínimo con L presionada para entrar en el ataque cargado.
const UMBRAL_HOLD_COSA3_MS = 300
// Cadencia propia del tap: 4 disparos por segundo, independiente de la
// animación del cuerpo (que sigue a 6 fps y dura 500 ms).
const CADENCIA_TAP_COSA3_MS = 250
// Margen para no perder un tap que llega justo antes de que la cadencia esté lista.
const BUFFER_TAP_COSA3_MS = 120

export default class MeleeAttackComponent {
  constructor(player) {
    this.player = player
    this.dano = 20
    this.cargandoCosa3 = false
    this.cargaAnimacionTerminada = false
    this.efectoCargaCosa3 = null
    this._inicioPresionCosa3 = 0
    this._presionCosa3Pendiente = false
    this._ultimoDisparoTapCosa3 = Number.NEGATIVE_INFINITY
    this._tapPendienteCosa3 = null
  }

  execute() {
    if (this.player.ataque || this.player.recibiendoDano || this.player.muerto) return

    // Permite conservar la llamada pública atacar() como ataque tap de Cosa 3.
    if (this.player.idleTexture === 'cosa3') {
      this._ejecutarAtaqueTapCosa3()
      return
    }

    this.player.ataque = true

    // Cosa 2 y Cosa 3 usan su ataque aéreo al subir, en el punto más alto y al caer.
    const tieneAtaqueAereo = ['cosa2', 'cosa3'].includes(this.player.idleTexture)
    const personajeEnElAire =
      tieneAtaqueAereo &&
      !this.player.movement.isGrounded() &&
      this.player.scene.anims.exists('atacarAereo')
    const animacionAtaque = personajeEnElAire ? 'atacarAereo' : 'atacar'
    this.player.play(animacionAtaque, true)

    const offsetX = this.player.flipX ? -30 : 30
    const hitbox = EntityFactory.createAttackHitbox(
      this.player.scene,
      this.player.x + offsetX,
      this.player.y,
      this.dano,
      this.player,
    )

    // Enemies overlap - use Phaser Group directly
    const enemiesGroup = this.player.enemies
    if (enemiesGroup && enemiesGroup.getChildren) {
      this.player.scene.physics.add.overlap(hitbox, enemiesGroup, (_, enemigo) => {
        const muerto = enemigo.takeDamage(hitbox.damage)
        if (muerto) {
          this.player.scene.onEnemyDied?.()
        }
        // Do NOT destroy hitbox here - allow multiple enemies hit
      })
    }

    // Boxes overlap - ensure it's a Phaser Group
    const boxes = this.player.boxes
    if (boxes) {
      const boxesGroup = Array.isArray(boxes)
        ? this.player.scene.physics.add.group({ children: boxes })
        : boxes

      this.player.scene.physics.add.overlap(hitbox, boxesGroup, (_, caja) => {
        caja.break()
      })
    }
  }

  manejarEntradaCosa3(presionada, mantenida, liberada) {
    if (this.player.idleTexture !== 'cosa3') return

    const ahora = this.player.scene.time.now

    if (this.player.recibiendoDano || this.player.muerto) {
      this._presionCosa3Pendiente = false
      this._tapPendienteCosa3 = null
      return
    }

    // Un nuevo toque se registra aunque la animación del disparo anterior siga
    // en curso; la cadencia de 250 ms es la que limita los disparos reales.
    if (presionada && !this.cargandoCosa3) {
      this._inicioPresionCosa3 = ahora
      this._presionCosa3Pendiente = true
    }

    // Mientras hay una carga activa se sigue procesando aunque ya no haya
    // una pulsación pendiente de evaluar.
    if (!this._presionCosa3Pendiente && !this.cargandoCosa3) {
      this._procesarTapPendienteCosa3(ahora)
      return
    }

    const tiempoPresionado = ahora - this._inicioPresionCosa3

    // Al superar el umbral se inicia la carga aunque L siga presionada.
    if (!this.cargandoCosa3 && mantenida && !liberada && tiempoPresionado >= UMBRAL_HOLD_COSA3_MS) {
      this._presionCosa3Pendiente = false
      this._iniciarCargaCosa3()
    }

    if (this.cargandoCosa3) {
      this._actualizarPosicionEfectoCarga()

      // El disparo cargado sale automáticamente al completar el efecto.
      if (this.cargaAnimacionTerminada) {
        this._finalizarCargaCosa3()
      } else if (liberada) {
        // Soltar después del umbral, pero antes de completar, cancela el ataque.
        this.cancelarCargaCosa3()
      }
      return
    }

    if (liberada && this._presionCosa3Pendiente) {
      this._presionCosa3Pendiente = false

      // Solo es tap si se soltó antes del umbral.
      if (tiempoPresionado < UMBRAL_HOLD_COSA3_MS) {
        this._solicitarTapCosa3(ahora)
      }
    }

    // Dispara el tap que quedó esperando a que terminara la cadencia.
    this._procesarTapPendienteCosa3(ahora)
  }

  _solicitarTapCosa3(ahora) {
    if (ahora - this._ultimoDisparoTapCosa3 >= CADENCIA_TAP_COSA3_MS) {
      this._tapPendienteCosa3 = null
      this._ejecutarAtaqueTapCosa3()
      return
    }

    // Solo se conserva un tap pendiente; si llega otro, reemplaza al anterior.
    this._tapPendienteCosa3 = ahora
  }

  _procesarTapPendienteCosa3(ahora) {
    if (this._tapPendienteCosa3 === null) return

    // Un tap demasiado antiguo se descarta para no acumular disparos.
    if (ahora - this._tapPendienteCosa3 > BUFFER_TAP_COSA3_MS) {
      this._tapPendienteCosa3 = null
      return
    }

    if (ahora - this._ultimoDisparoTapCosa3 < CADENCIA_TAP_COSA3_MS) return

    this._tapPendienteCosa3 = null
    this._ejecutarAtaqueTapCosa3()
  }

  _iniciarCargaCosa3() {
    this.cargandoCosa3 = true
    this.cargaAnimacionTerminada = false
    this._tapPendienteCosa3 = null
    this.player.ataque = true
    this.repetirAnimacionCargaCosa3()
    this._crearEfectoCargaCosa3()
  }

  cancelarCargaCosa3() {
    const estabaCargando = this.cargandoCosa3

    this.cargandoCosa3 = false
    this.cargaAnimacionTerminada = false
    this.efectoCargaCosa3?.destroy()
    this.efectoCargaCosa3 = null
    this._presionCosa3Pendiente = false
    this._tapPendienteCosa3 = null
    this.player.ataque = false

    // Al cancelar por daño o muerte se respeta la animación que ya está en curso.
    if (estabaCargando && !this.player.muerto && !this.player.recibiendoDano) {
      this._volverAEstadoNormalCosa3()
    }
  }

  _volverAEstadoNormalCosa3() {
    this.player.anims.stop()

    if (this.player.movement.isGrounded()) {
      this.player.setTexture(this.player.idleTexture)
    } else {
      this.player.play('saltar', true)
    }

    this.player.alignJumpSpriteWithHitbox()
  }

  _ejecutarAtaqueTapCosa3() {
    if (this.cargandoCosa3 || this.player.recibiendoDano || this.player.muerto) return

    this._ultimoDisparoTapCosa3 = this.player.scene.time.now
    this.player.ataque = true
    this.player.play(this._resolverAnimacionAtaqueCosa3(), true)
    this._crearEfectoAtaqueCosa3()
    this.dispararProyectilCosa3(false)
  }

  _resolverAnimacionAtaqueCosa3() {
    const scene = this.player.scene

    if (!this.player.movement.isGrounded() && scene.anims.exists('atacarAereo')) {
      return 'atacarAereo'
    }

    // Cosa 3 conserva la velocidad horizontal mientras ataca; si es distinta de
    // cero significa que se está desplazando y corresponde la hoja de carrera.
    const caminando = Math.abs(this.player.body?.velocity?.x ?? 0) > 1
    if (caminando && scene.anims.exists('atacar')) return 'atacar'

    return scene.anims.exists('atacarQuieto') ? 'atacarQuieto' : 'atacar'
  }

  repetirAnimacionCargaCosa3() {
    if (!this.cargandoCosa3) return false

    this.player.ataque = true
    this.player.play(this._resolverAnimacionAtaqueCosa3(), true)
    return true
  }

  _crearEfectoCargaCosa3() {
    const scene = this.player.scene
    const efecto = scene.add.sprite(this.player.x, this.player.y, 'character3ChargeEffect')
    this.efectoCargaCosa3 = efecto
    efecto.setDisplaySize(48, 48)
    efecto.setDepth(this.player.depth + 1)
    efecto.once('animationcomplete-cosa3ChargeEffect', () => {
      if (this.efectoCargaCosa3 === efecto) this.cargaAnimacionTerminada = true
    })
    efecto.play('cosa3ChargeEffect')
    this._actualizarPosicionEfectoCarga()
  }

  _actualizarPosicionEfectoCarga() {
    if (!this.efectoCargaCosa3?.active) return

    const direccion = this.player.flipX ? -1 : 1
    const cuerpo = this.player.body
    this.efectoCargaCosa3.setPosition(cuerpo.center.x + direccion * 22, cuerpo.center.y)
    this.efectoCargaCosa3.setFlipX(direccion < 0)
  }

  _crearEfectoAtaqueCosa3() {
    const scene = this.player.scene
    const direccion = this.player.flipX ? -1 : 1
    const cuerpo = this.player.body
    const efecto = scene.add.sprite(
      cuerpo.center.x + direccion * 16,
      cuerpo.center.y + 8,
      'character3AttackEffect',
    )

    efecto.setDisplaySize(48, 48)
    efecto.setFlipX(direccion < 0)
    efecto.setDepth(this.player.depth + 1)
    efecto.once('animationcomplete-cosa3AttackEffect', () => efecto.destroy())
    efecto.play('cosa3AttackEffect')
  }

  _finalizarCargaCosa3() {
    this.cargandoCosa3 = false
    this.cargaAnimacionTerminada = false
    this.efectoCargaCosa3?.destroy()
    this.efectoCargaCosa3 = null
    this._presionCosa3Pendiente = false
    // Libera el estado de carga antes de iniciar el ataque que dispara el proyectil.
    this.player.ataque = false
    this._ejecutarAtaqueCargadoCosa3()
  }

  _ejecutarAtaqueCargadoCosa3() {
    if (this.player.ataque || this.player.recibiendoDano || this.player.muerto) return

    this.player.ataque = true
    this.player.play(this._resolverAnimacionAtaqueCosa3(), true)
    this.dispararProyectilCosa3(true)
  }

  dispararProyectilCosa3(cargado = false) {
    const scene = this.player.scene
    const direccion = this.player.flipX ? -1 : 1
    const cuerpo = this.player.body
    const x = cuerpo.center.x + direccion * 16
    const y = cuerpo.center.y + 8
    const opciones = cargado
      ? {
          texture: 'character3ChargedBullet',
          animation: 'cosa3ChargedProjectile',
          speed: 360,
          displaySize: 54,
          hitboxSize: 14,
          lifetime: 1100,
          pierceBoxes: true,
        }
      : {
          texture: 'character3Bullet',
          // bullet.png es una imagen fija: no debe reproducir una animación.
          animation: null,
          speed: 420,
          displaySize: 48,
          hitboxSize: 8,
          // El dibujo de la bala está desplazado a la derecha del frame.
          hitboxOffsetX: direccion > 0 ? 18 : 6,
          hitboxOffsetY: 12,
          lifetime: 1600,
        }
    const proyectil = EntityFactory.createPlayerProjectile(
      scene,
      x,
      y,
      cargado ? this.dano * 2 : this.dano,
      opciones,
    )
    const overlaps = []

    proyectil.disparar(direccion)

    if (this.player.enemies?.getChildren) {
      overlaps.push(
        scene.physics.add.overlap(proyectil, this.player.enemies, (_, enemigo) => {
          if (!proyectil.active) return
          const enemigoDerrotado = enemigo.takeDamage(proyectil.damage)
          if (enemigoDerrotado) scene.onEnemyDied?.()
          proyectil.destroy()
        }),
      )
    }

    if (this.player.boxes) {
      const cajas = Array.isArray(this.player.boxes)
        ? scene.physics.add.group({ children: this.player.boxes })
        : this.player.boxes

      overlaps.push(
        scene.physics.add.overlap(proyectil, cajas, (_, caja) => {
          if (!proyectil.active) return
          caja.break()
          // Solo el cargado atraviesa las cajas; el disparo normal se detiene en la primera.
          if (!proyectil.pierceBoxes) proyectil.destroy()
        }),
      )
    }

    // Retira las colisiones temporales cuando el disparo impacta o expira.
    proyectil.once('destroy', () => overlaps.forEach((overlap) => overlap.destroy()))
  }
}
