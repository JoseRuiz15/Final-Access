import Level6Scene from './Level6Scene.js'
import { getCharacter } from '../configs/characters.js'
import EntityFactory from '../factories/EntityFactory.js'
import { playEnemySoundEffect } from '../services/EnemySoundEffects.js'
import { playPlayerSoundEffect } from '../services/PlayerSoundEffects.js'
import Phaser from 'phaser'

const SPAWN_Y = 736
const SPAWN_START_X = 58
const SPAWN_GAP = 40

export default class MultiplayerLevel6Scene extends Level6Scene {
  constructor(dependencies = {}, multiplayerStore) {
    super(dependencies)
    // Phaser 4 no inyecta this.events en la escena; creamos nuestro propio
    // EventEmitter para que la vista pueda escuchar 'game-over'.
    this.events = new Phaser.Events.EventEmitter()
    this.multiplayerStore = multiplayerStore
    this.remotePlayers = new Map()
    this.remoteProjectiles = new Map()
    this.lastPlayerStateAt = 0
    this.lastAppliedLevelStateRevision = -1
    this.lastAppliedPlayerHitCount = 0
    this.isEliminated = false
    this.isSpectating = false
    this.spectatorTargetId = null
    this.defeatedEnemyIds = new Set()
  }

  preload() {
    super.preload()

    const localCharacter = this.characterConfig
    const localTextureKeys = new Set([
      localCharacter?.texture,
      ...(localCharacter?.images || []).map(([key]) => key),
      ...(localCharacter?.spritesheets || []).map(([key]) => key),
      'playerWalk',
    ])
    const queuedTextureKeys = new Set(localTextureKeys)
    const localPlayerId = this.multiplayerStore?.socket?.id

    this.multiplayerStore?.players?.forEach((player) => {
      if (player.id === localPlayerId) return

      const character = getCharacter(player.characterId)
      character.images?.forEach(([key, path]) => {
        if (queuedTextureKeys.has(key) || this.textures.exists(key)) return
        this.load.image(key, path)
        queuedTextureKeys.add(key)
      })

      // Carga todas las spritesheets del personaje remoto (caminar, ataque, daño, muerte, etc.)
      character.spritesheets?.forEach(([key, path, size]) => {
        if (!queuedTextureKeys.has(key) && !this.textures.exists(key)) {
          this.load.spritesheet(key, path, size)
          queuedTextureKeys.add(key)
        }
      })
    })
  }

  create(data = {}) {
    this.events.off('enemy-damaged', this._handleEnemyDamaged, this)
    this.events.on('enemy-damaged', this._handleEnemyDamaged, this)
    this.events.off('enemy-defeated', this._handleLocalEnemyDefeated, this)
    this.events.on('enemy-defeated', this._handleLocalEnemyDefeated, this)
    this.events.off('box-broken', this._handleBoxBroken, this)
    this.events.on('box-broken', this._handleBoxBroken, this)
    this.events.off('key-picked-up', this._handleKeyPickedUp, this)
    this.events.on('key-picked-up', this._handleKeyPickedUp, this)
    this.events.off('key-dropped', this._handleKeyDropped, this)
    this.events.on('key-dropped', this._handleKeyDropped, this)
    this.events.off('box-key-spawned', this._handleBoxKeySpawned, this)
    this.events.on('box-key-spawned', this._handleBoxKeySpawned, this)
    this.events.off('player-life-lost', this._handlePlayerLifeLost, this)
    this.events.on('player-life-lost', this._handlePlayerLifeLost, this)
    this.events.off('door-open-request', this._handleDoorOpenRequest, this)
    this.events.on('door-open-request', this._handleDoorOpenRequest, this)
    super.create(data)
    this.remotePlayers.clear()
    this.remoteProjectiles.clear()
    this.lastPlayerStateAt = 0
    this.lastAppliedLevelStateRevision = -1
    this.lastAppliedPlayerHitCount = 0
    this.isEliminated = false
    this.isSpectating = false
    this.spectatorTargetId = null
    this.isMultiplayerLevel = true
    this.defeatedEnemyIds.clear()
    this.enemies?.getChildren().forEach((enemy) => {
      if (!enemy.body) return
      enemy.body.setAllowGravity(false)
      enemy.body.setImmovable(true)
      enemy.body.moves = false
      enemy.setVelocity(0, 0)
    })
    this._syncRemoteRoster()
    this._syncLevelState()
  }

  _createPlayer() {
    super._createPlayer()

    const playerIndex = this.multiplayerStore?.players?.findIndex(
      (player) => player.id === this.multiplayerStore.socket?.id,
    )
    const spawnX = SPAWN_START_X + Math.max(0, playerIndex ?? 0) * SPAWN_GAP

    this.player.setPosition(spawnX, SPAWN_Y)
    this.player.body.reset(spawnX, SPAWN_Y)
    this.player.spawnX = spawnX
    this.player.spawnY = SPAWN_Y
    this.player.multiplayerPlayerId = this.multiplayerStore?.socket?.id
  }

  _createEnemies() {
    super._createEnemies()
    this.enemies.getChildren().forEach((enemy, index) => {
      enemy.multiplayerId = `enemy-${index}`
    })
  }

  _createBoxes() {
    super._createBoxes()
    this.boxes.getChildren().forEach((box, index) => {
      box.multiplayerId = `box-${index}`
      if (box.keyData) box.keyData.multiplayerId = `key-box-${index}`
    })
  }

  update(time, delta) {
    this._syncRemoteRoster()
    this._applyIncomingPlayerHits()
    super.update(time, delta)

    const now = this.time.now
    if (this.player?.active && now - this.lastPlayerStateAt >= 50) {
      this.multiplayerStore?.sendPlayerState?.({
        x: this.player.x,
        y: this.player.y,
        flipX: this.player.flipX,
        moving: Math.abs(this.player.body?.velocity?.x ?? 0) > 1,
        dead: this.player.muerto,
        attacking: !!this.player.ataque,
        damaged: !!this.player.recibiendoDano,
        attackAnimation: this.player.ataque
          ? this.player.anims?.currentAnim?.key
          : undefined,
      })
      this.lastPlayerStateAt = now
    }

    this._syncLevelState()
    this._syncEnemyPositions()
    this._syncEnemyProjectiles()
    this._syncDefeatedEnemies()
    const interpolation = Math.min(1, Math.max(0.12, delta / 80))

    this.remotePlayers.forEach((remote, id) => {
      const state = this.multiplayerStore?.playerStates?.[id]
      if (state) {
        remote.targetX = state.x
        remote.targetY = state.y
        remote.sprite.setFlipX(state.flipX)

        if (state.dead) {
          if (!remote.isDead) {
            remote.sprite.stop()
            remote.isWalking = false
            remote.sprite.play(remote.deadAnimation, true)
            remote.isDead = true
          }
          remote.sprite.muerto = true
        } else {
          remote.sprite.muerto = false
          remote.isDead = false

          if (state.damaged) {
            if (!remote.isDamaged) {
              remote.sprite.stop()
              remote.isWalking = false
              remote.isAttacking = false
              remote.sprite.play(remote.damageAnimation, true)
              remote.isDamaged = true
            }
          } else if (state.attacking) {
            const attackVariant = remote.attackAnimations?.[state.attackAnimation]
              ? state.attackAnimation
              : 'atacar'
            const attackAnimation = remote.attackAnimations?.[attackVariant]
            const currentAnim = remote.sprite.anims?.currentAnim
            if (attackAnimation && (!remote.isAttacking || currentAnim?.key !== attackAnimation)) {
              remote.sprite.stop()
              remote.isWalking = false
              remote.isDamaged = false
              remote.sprite.play(attackAnimation, true)
            }
            remote.isAttacking = true
          } else {
            const currentAnim = remote.sprite.anims?.currentAnim
            if (
              remote.isDamaged ||
              remote.isAttacking ||
              currentAnim?.key === remote.deadAnimation
            ) {
              remote.sprite.stop()
              remote.sprite.setTexture(remote.texture)
            }
            remote.isDamaged = false
            remote.isAttacking = false

            if (state.moving && !remote.isWalking) {
              remote.sprite.play(remote.walkAnimation, true)
              remote.isWalking = true
            } else if (!state.moving && remote.isWalking) {
              remote.sprite.stop()
              remote.sprite.setTexture(remote.texture)
              remote.isWalking = false
            }
          }
        }
      }

      remote.sprite.x += (remote.targetX - remote.sprite.x) * interpolation
      remote.sprite.y += (remote.targetY - remote.sprite.y) * interpolation
      remote.nameTag.setPosition(remote.sprite.x, remote.sprite.y - 34)
    })

    if (this.isSpectating) {
      const target = this.remotePlayers.get(this.spectatorTargetId)
      const targetState = this.multiplayerStore?.playerStates?.[this.spectatorTargetId]
      const targetAlive =
        target && (targetState ? targetState.dead !== true : !target.sprite.muerto)

      if (!target) {
        if (this.remotePlayers.size > 0) this._followAliveTeammate()
      } else if (!targetAlive) {
        this._followAliveTeammate()
      }
    }
  }

  _handleLocalEnemyDefeated(enemy) {
    if (!enemy?.multiplayerId) return
    this.defeatedEnemyIds.add(enemy.multiplayerId)
    this.multiplayerStore?.reportEnemyDefeated?.(enemy.multiplayerId)
  }

  _handleEnemyDamaged({ enemy, health, maxHealth }) {
    if (!enemy?.multiplayerId) return
    this.multiplayerStore?.reportEnemyDamage?.(enemy.multiplayerId, health, maxHealth)
  }

  _handleBoxBroken(box) {
    if (!box?.multiplayerId) return
    this.multiplayerStore?.reportBoxBroken?.(box.multiplayerId)
  }

  _handleKeyPickedUp(keyData) {
    this.multiplayerStore?.reportKeyPickedUp?.(keyData)
  }

  _handleKeyDropped({ keyData, x, y }) {
    this.multiplayerStore?.reportKeyDropped?.(keyData, x, y)
  }

  _handleBoxKeySpawned(key) {
    const keyId = key?.multiplayerId
    if (!keyId) return

    const state = this.multiplayerStore?.levelState || {}
    if ((state.collectedKeys || []).some((entry) => entry.multiplayerId === keyId)) {
      key.destroy()
      return
    }

    const droppedKey = (state.droppedKeys || []).find((entry) => entry.multiplayerId === keyId)
    if (droppedKey) {
      key.setPosition(droppedKey.x, droppedKey.y)
      key.body?.reset(droppedKey.x, droppedKey.y)
    }
  }

  _handlePlayerLifeLost(vidas) {
    const vidasRestantes = Number(vidas)
    if (Number.isFinite(vidasRestantes)) {
      this.gameRepository.vidas = Math.max(0, vidasRestantes)
      if (vidasRestantes <= 0) this.isEliminated = true
    }
    this.multiplayerStore?.reportLifeLost?.(vidasRestantes)
  }

  _handleDoorOpenRequest() {
    this.multiplayerStore?.requestDoorOpen?.()
  }

  onPlayerDeath() {
    if (!this.player || this._deathHandled) return
    this._deathHandled = true

    if (this.isEliminated || this.player.vidas <= 0) {
      this._eliminatePlayer()
      return
    }

    this.time.delayedCall(300, () => {
      if (!this.player?.active) return

      // Una actualización del servidor pudo confirmar la eliminación mientras
      // se reproducía la animación de muerte.
      if (this.isEliminated) {
        this._eliminatePlayer()
        return
      }

      this.player.respawn()
      this.movingPlatformManager?.resetCaedizas()
      this._deathHandled = false
    })
  }

  _eliminatePlayer() {
    this.isEliminated = true
    playPlayerSoundEffect(this, 'gameOver')
    this.events.emit('game-over')
  }

  enterSpectatorMode() {
    if (this.isSpectating) return true
    if (!this.isEliminated && (this.player?.vidas ?? 0) > 0) return false

    this.isEliminated = true
    this.isSpectating = true
    this._deathHandled = true

    const player = this.player
    if (player) {
      this.multiplayerStore?.sendPlayerState?.({
        x: player.x,
        y: player.y,
        flipX: player.flipX,
        moving: false,
        dead: true,
      })
      player.setVelocity(0, 0)
      if (player.body) player.body.enable = false
      player.muerto = true
      player.setActive(false)
      player.setVisible(false)
    }

    this._followAliveTeammate()
    return true
  }

  _followAliveTeammate() {
    const remotes = [...this.remotePlayers.entries()]
    if (!remotes.length) {
      this.spectatorTargetId = null
      this.cameras.main.stopFollow()
      return
    }

    const isAlive = ([id, remote]) => {
      const state = this.multiplayerStore?.playerStates?.[id]
      return state ? state.dead !== true : !remote.sprite.muerto
    }
    const current = remotes.find(([id]) => id === this.spectatorTargetId)
    const next =
      (current && isAlive(current) ? current : remotes.find(isAlive)) ?? current ?? remotes[0]

    if (this.spectatorTargetId === next[0]) return

    this.spectatorTargetId = next[0]
    this.cameras.main.startFollow(next[1].sprite, true, 0.12, 0.12)
  }

  _applyIncomingPlayerHits() {
    const hits = this.multiplayerStore?.incomingPlayerHits || []
    for (let index = this.lastAppliedPlayerHitCount; index < hits.length; index++) {
      const hit = hits[index]
      if (!hit) continue
      if (hit?.playerId === this.multiplayerStore?.socket?.id && this.player?.active) {
        this.player.recibirDano(hit.damage)
      }
    }
    this.lastAppliedPlayerHitCount = hits.length
  }

  _syncLevelState() {
    const store = this.multiplayerStore
    const revision = store?.levelStateRevision ?? 0
    if (revision === this.lastAppliedLevelStateRevision) return
    this.lastAppliedLevelStateRevision = revision

    const state = store?.levelState || {}
    const brokenBoxIds = new Set(state.brokenBoxIds || [])
    this.boxes?.getChildren().forEach((box) => {
      if (brokenBoxIds.has(box.multiplayerId) && box.active && !box.rompiendo) {
        box.break({ broadcast: false })
      }
    })

    Object.entries(state.enemyHealth || {}).forEach(([enemyId, health]) => {
      const enemy = this.enemies
        ?.getChildren()
        .find((candidate) => candidate.multiplayerId === enemyId)
      enemy?.health?.applySynchronizedHealth(health)
    })
    this._syncDefeatedEnemies()

    const localPlayerId = this.multiplayerStore?.socket?.id
    const localLives = Number(state.playerLives?.[localPlayerId])
    if (Number.isFinite(localLives) && this.player) {
      // El servidor es la fuente de verdad para el HUD. No se sobrescribe
      // player.vidas aquí: una actualización atrasada podría revivir al
      // jugador que acaba de perder su última vida.
      this.gameRepository.vidas = Math.max(0, localLives)
      if (localLives <= 0) this.isEliminated = true
    }

    const collectedKeys = state.collectedKeys || []
    const collectedIds = new Set(collectedKeys.map((key) => key.multiplayerId))
    this.player?.inventory?.setSharedKeys(collectedKeys)

    const keys = this.keyManager?.getKeysGroup()
    keys?.getChildren().forEach((key) => {
      if (collectedIds.has(key.multiplayerId)) key.destroy()
    })

    state.droppedKeys?.forEach((keyData) => {
      if (!keyData.multiplayerId || collectedIds.has(keyData.multiplayerId) || !keys) return
      const existing = keys.getChildren().find((key) => key.multiplayerId === keyData.multiplayerId)
      if (existing) {
        existing.setPosition(keyData.x, keyData.y)
        existing.body?.reset(keyData.x, keyData.y)
        return
      }

      const key = EntityFactory.createKey(this, keyData.x, keyData.y, keyData.texture, keyData)
      keys.add(key)
      key.setVelocity(0, 0)
    })

    if (state.doorOpen) {
      this.doorManager?.getDoorSprite()?.setTexture('greenDoor')
      this.doorManager?.getDoors()?.objects?.forEach((door) => {
        door.abierta = true
      })
    }
  }

  _getRenderedEnemySnapshot() {
    const history = (this.multiplayerStore?.enemySnapshotHistory || []).filter((snapshot) =>
      Number.isFinite(Number(snapshot?.sentAt)),
    )
    const latest = this.multiplayerStore?.enemySnapshot
    if (!history.length) return latest

    // Todas las pantallas representan el mismo instante del servidor, con
    // 100 ms de margen para interpolar entre los mismos dos snapshots.
    const renderAt = Date.now() + (Number(this.multiplayerStore?.serverClockOffsetMs) || 0) - 100
    let before = history[0]
    let after = history[0]
    for (const snapshot of history) {
      if (Number(snapshot.sentAt) <= renderAt) {
        before = snapshot
      } else {
        after = snapshot
        break
      }
    }

    if (before === after) {
      const extrapolation = Math.min(50, Math.max(0, renderAt - Number(before.sentAt))) / 1000
      if (!extrapolation) return before
      return {
        ...before,
        enemies: Object.fromEntries(
          Object.entries(before.enemies || {}).map(([id, state]) => [
            id,
            {
              ...state,
              x: Number(state.x) + (Number(state.vx) || 0) * extrapolation,
              y: Number(state.y) + (Number(state.vy) || 0) * extrapolation,
            },
          ]),
        ),
        projectiles: (before.projectiles || []).map((projectile) => ({
          ...projectile,
          x: Number(projectile.x) + (Number(projectile.vx) || 0) * extrapolation,
          y: Number(projectile.y) + (Number(projectile.vy) || 0) * extrapolation,
        })),
      }
    }

    const span = Math.max(1, Number(after.sentAt) - Number(before.sentAt))
    const alpha = Math.min(1, Math.max(0, (renderAt - Number(before.sentAt)) / span))
    const mixStates = (previous, current) => {
      if (!previous) return current
      if (!current) return previous
      const selected = alpha < 0.5 ? previous : current
      return {
        ...selected,
        x: Number(previous.x) + (Number(current.x) - Number(previous.x)) * alpha,
        y: Number(previous.y) + (Number(current.y) - Number(previous.y)) * alpha,
      }
    }
    const enemyIds = new Set([
      ...Object.keys(before.enemies || {}),
      ...Object.keys(after.enemies || {}),
    ])
    const enemies = {}
    enemyIds.forEach((id) => {
      enemies[id] = mixStates(before.enemies?.[id], after.enemies?.[id])
    })

    const previousProjectiles = new Map((before.projectiles || []).map((p) => [p.id, p]))
    const currentProjectiles = new Map((after.projectiles || []).map((p) => [p.id, p]))
    const projectileIds = new Set([...previousProjectiles.keys(), ...currentProjectiles.keys()])
    const projectiles = []
    projectileIds.forEach((id) => {
      const previous = previousProjectiles.get(id)
      const current = currentProjectiles.get(id)
      const state = mixStates(previous, current)
      if (state) projectiles.push(state)
    })

    return {
      ...after,
      enemies,
      projectiles,
      defeatedEnemyIds: alpha < 0.5 ? before.defeatedEnemyIds : after.defeatedEnemyIds,
    }
  }

  _syncEnemyPositions() {
    const enemies = this._getRenderedEnemySnapshot()?.enemies || {}
    this.enemies?.getChildren().forEach((enemy) => {
      const state = enemies[enemy.multiplayerId]
      if (!state || !enemy.active) return

      enemy.setPosition(state.x, state.y)
      enemy.setVelocity(0, 0)
      enemy.body?.updateFromGameObject()
      enemy.setFlipX(state.flipX)
      enemy.health?.applySynchronizedHealth(state.health)

      // Un enemigo muerto ya está reproduciendo su animación de muerte; no
      // hay que pisarla con el frame de mira ni con la de daño.
      if (enemy.muerto) return

      const isDrone = enemy.config?.tipo === 'dron'
      if (isDrone && state.targetId) {
        // El servidor manda el frame de mira (2/0/1); el cliente ajusta
        // también la altura del cañón, igual que DroneEnemy._updateAim().
        enemy.applyNetworkAimFrame?.(state.frame)
      } else if (isDrone) {
        enemy.clearNetworkAim?.()
      }

      // Si el enemigo está recibiendo daño, no se pisan sus animaciones con
      // caminar/ataque; EnemyAnimationComponent resetea recibiendoDano al
      // terminar la animación, igual que en los niveles normales.
      if (!enemy.recibiendoDano) {
        const isAttacking = state.attacking === true
        if (isAttacking && !enemy._networkAttacking) {
          enemy.playAttackAnimation?.()
        } else if (!isAttacking && enemy._networkAttacking) {
          enemy.attackEffect?.setVisible(false)
        }
        enemy._networkAttacking = isAttacking

        if (isAttacking) {
          // Durante el ataque no se aplica movimiento de caminar.
        } else {
          // El dron solo camina cuando no tiene objetivo; con objetivo se queda
          // quieto apuntando, como en los niveles normales.
          if (isDrone && state.targetId) {
            // se queda quieto apuntando
          } else if (state.moving && enemy.animWalk) {
            if (enemy.anims.currentAnim?.key !== enemy.animWalk || !enemy.anims.isPlaying) {
              enemy.play(enemy.animWalk, true)
            }
          } else if (!state.moving) {
            enemy.stopWalkAnimation?.()
          }
        }
      }
    })
  }

  _syncEnemyProjectiles() {
    const projectiles = this._getRenderedEnemySnapshot()?.projectiles || []
    const activeIds = new Set(projectiles.map((projectile) => projectile.id))

    this.remoteProjectiles.forEach((sprite, id) => {
      if (activeIds.has(id)) return
      sprite.destroy()
      this.remoteProjectiles.delete(id)
    })

    projectiles.forEach((projectile) => {
      let sprite = this.remoteProjectiles.get(projectile.id)
      if (!sprite) {
        sprite = this.add
          .image(projectile.x, projectile.y, projectile.texture)
          .setScale(projectile.scale ?? 1)
          .setDepth(5)
        this.remoteProjectiles.set(projectile.id, sprite)

        // El servidor crea la bala después de fireDelay; recién ahí suena el
        // disparo, igual que RangedAttackComponent en los niveles normales.
        const enemy = this.enemies
          ?.getChildren()
          .find((candidate) => candidate.multiplayerId === projectile.enemyId)
        if (enemy) playEnemySoundEffect(this, enemy.soundProfile, 'shot')
      }

      sprite.setPosition(projectile.x, projectile.y)
      sprite.setRotation(Math.atan2(projectile.vy, projectile.vx))
    })
  }

  _syncDefeatedEnemies() {
    const defeatedIds = new Set([
      ...this.defeatedEnemyIds,
      ...(this.multiplayerStore?.defeatedEnemyIds || []),
      ...(this.multiplayerStore?.enemySnapshot?.defeatedEnemyIds || []),
    ])
    if (!defeatedIds.size || !this.enemies) return

    const enemies = this.enemies.getChildren()
    defeatedIds.forEach((enemyId) => {
      const enemy = enemies.find((candidate) => candidate.multiplayerId === enemyId)
      if (!enemy?.active || enemy.muerto) return

      enemy.recibiendoDano = false
      enemy.stop()
      enemy.health.applySynchronizedHealth(0)
    })
  }

  _syncRemoteRoster() {
    const localPlayerId = this.multiplayerStore?.socket?.id
    const players = (this.multiplayerStore?.players || []).filter(
      (player) => player.id !== localPlayerId,
    )
    const activeIds = new Set(players.map((player) => player.id))

    this.remotePlayers.forEach((remote, id) => {
      if (activeIds.has(id)) return
      remote.sprite.destroy()
      remote.nameTag.destroy()
      this.remotePlayers.delete(id)
    })

    players.forEach((player) => {
      if (this.remotePlayers.has(player.id)) return

      const playerIndex = this.multiplayerStore.players.findIndex((entry) => entry.id === player.id)
      const spawnX = SPAWN_START_X + Math.max(0, playerIndex) * SPAWN_GAP
      const character = getCharacter(player.characterId)
      const texture = this.textures.exists(character.texture) ? character.texture : 'player'
      const walkAnimation = `remoteWalk-${character.id}`
      const initialState = this.multiplayerStore.playerStates?.[player.id]
      const x = initialState?.x ?? spawnX
      const y = initialState?.y ?? SPAWN_Y
      const sprite = this.add.sprite(x, y, texture).setDisplaySize(48, 48).setDepth(2)
      sprite.multiplayerPlayerId = player.id
      const nameTag = this.add
        .text(x, y - 34, player.username || 'Jugador', {
          fontFamily: 'Press Start 2P',
          fontSize: '9px',
          color: '#ffffff',
          stroke: '#080e20',
          strokeThickness: 4,
        })
        .setOrigin(0.5, 1)
        .setDepth(20)

      this._ensureRemoteWalkAnimation(character, walkAnimation)
      const attackAnimations = this._ensureRemoteAttackAnimations(character)
      this._ensureRemoteDamageAnimation(character)
      this._ensureRemoteDeadAnimation(character)

      this.remotePlayers.set(player.id, {
        sprite,
        nameTag,
        texture,
        walkAnimation,
        attackAnimations,
        damageAnimation: `remoteDamage-${character.id}`,
        deadAnimation: `remoteDead-${character.id}`,
        isWalking: false,
        isDamaged: false,
        isAttacking: false,
        isDead: false,
        targetX: x,
        targetY: y,
      })
    })
  }

  _ensureRemoteWalkAnimation(character, animationKey) {
    if (this.anims.exists(animationKey)) return

    const walk = character.animFrames?.walk
    const sheet = walk?.sheet ?? 'playerWalk'
    if (!this.textures.exists(sheet)) return

    this.anims.create({
      key: animationKey,
      frames: this.anims.generateFrameNumbers(sheet, {
        start: walk?.start ?? 0,
        end: walk?.end ?? 7,
      }),
      frameRate: walk?.frameRate ?? 10,
      repeat: -1,
    })
  }

  _ensureRemoteAttackAnimations(character) {
    const attack = character.animFrames?.attack
    const attackIdle = character.animFrames?.attackIdle || attack
    const attackAir = character.animFrames?.jumpAttack || attack
    const defaultAttack = character.id === 'cosa1'
      ? { sheet: 'playerAttack', start: 0, end: 12, frameRate: 18, repeat: 0 }
      : null
    const definitions = {
      atacar: attack || defaultAttack,
      atacarQuieto: attackIdle || defaultAttack,
      atacarAereo: attackAir || defaultAttack,
    }
    const animations = {}

    Object.entries(definitions).forEach(([variant, frames]) => {
      if (!frames?.sheet || !this.textures.exists(frames.sheet)) return
      const key = `remoteAttack-${character.id}-${variant}`
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(frames.sheet, {
            start: frames.start ?? 0,
            end: frames.end ?? 7,
          }),
          frameRate: frames.frameRate ?? 18,
          repeat: 0,
        })
      }
      animations[variant] = key
    })

    return animations
  }

  _ensureRemoteDamageAnimation(character) {
    const key = `remoteDamage-${character.id}`
    if (this.anims.exists(key)) return

    const animFrames = character.animFrames?.damage
    const sheet = animFrames?.sheet ?? (character.id === 'cosa1' ? 'playerDamage' : null)
    if (!sheet || !this.textures.exists(sheet)) return

    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers(sheet, {
        start: animFrames?.start ?? 0,
        end: animFrames?.end ?? 5,
      }),
      frameRate: animFrames?.frameRate ?? 12,
      repeat: 0,
    })
  }

  _ensureRemoteDeadAnimation(character) {
    const key = `remoteDead-${character.id}`
    if (this.anims.exists(key)) return

    const animFrames = character.animFrames?.dead
    const sheet = animFrames?.sheet ?? (character.id === 'cosa1' ? 'playerDead' : null)
    if (!sheet || !this.textures.exists(sheet)) return

    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers(sheet, {
        start: animFrames?.start ?? 0,
        end: animFrames?.end ?? 5,
      }),
      frameRate: animFrames?.frameRate ?? 12,
      repeat: 0,
    })
  }
}
