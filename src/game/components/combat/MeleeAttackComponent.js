import EntityFactory from '../../factories/EntityFactory.js'

export default class MeleeAttackComponent {
  constructor(player) {
    this.player = player
    this.dano = 20
    this.cargandoCosa3 = false
    this.cargaAnimacionTerminada = false
    this.efectoCargaCosa3 = null
  }

  execute() {
    if (this.player.ataque || this.player.recibiendoDano || this.player.muerto) return

    // Permite conservar la llamada pública atacar() como disparo normal de Cosa 3.
    if (this.player.idleTexture === 'cosa3') {
      this._ejecutarAtaqueCosa3(false)
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

    if (presionada && !this.player.ataque && !this.cargandoCosa3) {
      this.cargandoCosa3 = true
      this.cargaAnimacionTerminada = false
      this.player.ataque = true
      this.repetirAnimacionCargaCosa3()
      this._crearEfectoCargaCosa3()
    }

    if (!this.cargandoCosa3) return

    this._actualizarPosicionEfectoCarga()

    // Si se completa la animación mientras L sigue abajo, dispara cargado.
    if (this.cargaAnimacionTerminada && mantenida) {
      this._finalizarCargaCosa3(true)
    } else if (liberada) {
      // Si se suelta L antes de completar la carga, dispara el proyectil normal.
      this._finalizarCargaCosa3(this.cargaAnimacionTerminada)
    }
  }

  cancelarCargaCosa3() {
    this.cargandoCosa3 = false
    this.cargaAnimacionTerminada = false
    this.efectoCargaCosa3?.destroy()
    this.efectoCargaCosa3 = null
    this.player.ataque = false
  }

  repetirAnimacionCargaCosa3() {
    if (!this.cargandoCosa3) return false

    const personajeEnElAire =
      !this.player.movement.isGrounded() && this.player.scene.anims.exists('atacarAereo')
    this.player.ataque = true
    this.player.play(personajeEnElAire ? 'atacarAereo' : 'atacar', true)
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

  _finalizarCargaCosa3(cargado) {
    this.cargandoCosa3 = false
    this.cargaAnimacionTerminada = false
    this.efectoCargaCosa3?.destroy()
    this.efectoCargaCosa3 = null
    // Libera el estado de carga antes de iniciar el ataque que dispara el proyectil.
    this.player.ataque = false
    this._ejecutarAtaqueCosa3(cargado)
  }

  _ejecutarAtaqueCosa3(cargado) {
    if (this.player.ataque || this.player.recibiendoDano || this.player.muerto) return

    this.player.ataque = true
    const personajeEnElAire =
      !this.player.movement.isGrounded() && this.player.scene.anims.exists('atacarAereo')
    this.player.play(personajeEnElAire ? 'atacarAereo' : 'atacar', true)
    this.dispararProyectilCosa3(cargado)
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
      : { lifetime: 400 }
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
