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

      const walkSheet = character.animFrames?.walk?.sheet
      const walkAsset = character.spritesheets?.find(([key]) => key === walkSheet)
      if (
        walkAsset &&
        !queuedTextureKeys.has(walkAsset[0]) &&
        !this.textures.exists(walkAsset[0])
      ) {
        this.load.spritesheet(walkAsset[0], walkAsset[1], walkAsset[2])
        queuedTextureKeys.add(walkAsset[0])
      }
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
    this.events.off('player-life-lost', this._handlePlayerLifeLost, this)
    this.events.on('player-life-lost', this._handlePlayerLifeLost, this)
    this.events.off('door-opened', this._handleDoorOpened, this)
    this.events.on('door-opened', this._handleDoorOpened, this)
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
    this.isMultiplayerAuthority = false
    this.enemies?.getChildren().forEach((enemy) => {
      if (!enemy.body) return
      enemy.body.setAllowGravity(enemy.config?.tipo !== 'dron')
      enemy.body.setVelocity(0, 0)
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
      this.multiplayerStore?.sendPlayerState({
        x: this.player.x,
        y: this.player.y,
        flipX: this.player.flipX,
        moving: Math.abs(this.player.body?.velocity?.x ?? 0) > 1,
        dead: this.player.muerto,
      })
      this.lastPlayerStateAt = now
    }

    this._syncLevelState()
    this._syncEnemyPositions(delta)
    this._syncEnemyProjectiles()
    this._syncDefeatedEnemies()
    const interpolation = Math.min(1, Math.max(0.12, delta / 80))

    this.remotePlayers.forEach((remote, id) => {
      const state = this.multiplayerStore?.playerStates?.[id]
      if (state) {
        remote.targetX = state.x
        remote.targetY = state.y
        remote.sprite.muerto = state.dead === true
        remote.sprite.setFlipX(state.flipX)

        const dañado = now < remote.dañadoHasta

        if (dañado) {
          // Durante el daño no se pisa la animación con caminar/quieto.
          if (remote.isWalking) {
            remote.sprite.stop()
            remote.isWalking = false
          }
        } else {
          // El daño terminó: restaurar textura base si quedó en el frame de daño.
          const currentAnim = remote.sprite.anims?.currentAnim
          if (currentAnim && currentAnim.key === 'playerDamage') {
            remote.sprite.stop()
            remote.sprite.setTexture(remote.texture)
          }

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
    this.multiplayerStore?.reportEnemyDefeated(enemy.multiplayerId)
  }

  _handleEnemyDamaged({ enemy, damage, maxHealth }) {
    if (!enemy?.multiplayerId) return
    this.multiplayerStore?.reportEnemyDamage(enemy.multiplayerId, damage, maxHealth)
  }

  _handleBoxBroken(box) {
    if (!box?.multiplayerId) return
    this.multiplayerStore?.reportBoxBroken(box.multiplayerId)
  }

  _handleKeyPickedUp(keyData) {
    this.multiplayerStore?.reportKeyPickedUp(keyData)
  }

  _handleKeyDropped({ keyData, x, y }) {
    this.multiplayerStore?.reportKeyDropped(keyData, x, y)
  }

  _handlePlayerLifeLost(vidas) {
    const vidasRestantes = Number(vidas)
    if (Number.isFinite(vidasRestantes)) {
      this.gameRepository.vidas = Math.max(0, vidasRestantes)
      if (vidasRestantes <= 0) this.isEliminated = true
    }
    this.multiplayerStore?.reportLifeLost()
  }

  _handleDoorOpened() {
    this.multiplayerStore?.reportDoorOpened()
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
      this.multiplayerStore?.sendPlayerState({
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
    const now = this.time.now
    for (let index = this.lastAppliedPlayerHitCount; index < hits.length; index++) {
      const hit = hits[index]
      if (!hit) continue
      if (hit?.playerId === this.multiplayerStore?.socket?.id && this.player?.active) {
        this.player.recibirDano(hit.damage)
      } else {
        const remote = this.remotePlayers.get(hit.playerId)
        if (remote?.sprite && remote.sprite.active && !remote.sprite.muerto) {
          remote.dañadoHasta = now + 1500
          remote.sprite.play('playerDamage', true)
        }
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

  _syncEnemyPositions(delta) {
    const enemies = this.multiplayerStore?.enemySnapshot?.enemies || {}
    const interpolation = Math.min(1, Math.max(0.12, delta / 100))
    this.enemies?.getChildren().forEach((enemy) => {
      const state = enemies[enemy.multiplayerId]
      if (!state || !enemy.active) return

      const x = enemy.x + (state.x - enemy.x) * interpolation
      const y = enemy.y + (state.y - enemy.y) * interpolation
      enemy.setPosition(x, y)
      enemy.body?.updateFromGameObject()
      enemy.setFlipX(state.flipX)
      enemy.health?.applySynchronizedHealth(state.health)

      // Un enemigo muerto ya está reproduciendo su animación de muerte; no
      // hay que pisarla con el frame de mira.
      if (enemy.muerto) return

      const isDrone = enemy.config?.tipo === 'dron'
      if (isDrone && state.targetId) {
        // El servidor manda el frame de mira (2/0/1); el cliente ajusta
        // también la altura del cañón, igual que DroneEnemy._updateAim().
        enemy.applyNetworkAimFrame?.(state.frame)
      } else if (isDrone) {
        enemy.clearNetworkAim?.()
      }

      if (enemy.recibiendoDano) return

      const isAttacking = state.attacking === true
      if (isAttacking && !enemy._networkAttacking) {
        enemy.playAttackAnimation?.()
      } else if (!isAttacking && enemy._networkAttacking) {
        enemy.attackEffect?.setVisible(false)
      }
      enemy._networkAttacking = isAttacking

      if (isAttacking) return

      // El dron solo camina cuando no tiene objetivo; con objetivo se queda
      // quieto apuntando, como en los niveles normales.
      if (isDrone && state.targetId) return

      if (state.moving && enemy.animWalk) {
        if (enemy.anims.currentAnim?.key !== enemy.animWalk || !enemy.anims.isPlaying) {
          enemy.play(enemy.animWalk, true)
        }
      } else if (!state.moving) {
        enemy.stopWalkAnimation?.()
      }
    })
  }

  _syncEnemyProjectiles() {
    const projectiles = this.multiplayerStore?.enemySnapshot?.projectiles || []
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
    const defeatedIds = this.multiplayerStore?.defeatedEnemyIds || []
    if (!defeatedIds.length || !this.enemies) return

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

      this.remotePlayers.set(player.id, {
        sprite,
        nameTag,
        texture,
        walkAnimation,
        isWalking: false,
        dañadoHasta: 0,
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
}
