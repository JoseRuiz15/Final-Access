const TILE_SIZE = 32
const GRAVITY = 800

/** @typedef {{id:string,x:number,y:number,vx:number,vy:number,health:number,maxHealth:number,speed:number,leftLimit:number,rightLimit:number,direction:number,flipX:boolean,tipo:string,detection:number,attackRange:number,damage:number,sameLevelTolerance:number,marginePersecucionX:number,attackLockMs:number,attackCooldown:number,fireDelay:number,attackingUntil:number,nextAttackAt:number,fireAt:number,fireTargetId:string|null,targetId:string|null,aimFrame:number|null,blockedX:boolean}} Level6Enemy */
/** @typedef {{id:string,enemyId:string,texture:string,scale:number,x:number,y:number,vx:number,vy:number,damage:number,expiresAt:number,frame:number|null}} Level6Projectile */
/** @typedef {{startedAt:number,lastTickAt:number,sequence:number,projectileSequence:number,enemies:Record<string,Level6Enemy>,projectiles:Level6Projectile[]}} Level6Simulation */
/** @typedef {{sequence:number,sentAt:number,enemies:Record<string,Record<string,unknown>>,projectiles:Array<Record<string,unknown>>,defeatedEnemyIds:string[]}} Level6Snapshot */

// Collidable cells from the Level 6 Tiled Ground layer, compressed as row runs.
const SOLID_RUNS = [
  [10, 52, 57], [11, 56, 57],
  [14, 24, 30], [14, 100, 109],
  [15, 24, 26], [15, 35, 36], [15, 100, 109],
  [16, 100, 109], [17, 94, 95], [18, 40, 41],
  [20, 48, 61], [21, 35, 36], [21, 48, 61],
  [22, 48, 61], [23, 48, 61],
  [24, 0, 9], [24, 14, 16], [24, 22, 31], [24, 48, 61],
  [25, 0, 9], [25, 22, 31], [25, 48, 61],
  [26, 0, 9], [26, 48, 61], [27, 0, 9], [27, 48, 61],
  [28, 0, 9], [28, 48, 61], [29, 0, 9], [29, 48, 61],
]

const SOLID_ROWS = new Map()
for (const [row, firstColumn, lastColumn] of SOLID_RUNS) {
  const runs = SOLID_ROWS.get(row) || []
  runs.push([firstColumn, lastColumn])
  SOLID_ROWS.set(row, runs)
}

const ENEMY_DEFINITIONS = [
  { x: 750, y: 736, vida: 20, left: 600, right: 1000 },
  { x: 1000, y: 736, vida: 20, left: 600, right: 1000 },
  { x: 880, y: 416, vida: 20, left: 780, right: 950 },
  { x: 1790, y: 608, vida: 20, left: 1600, right: 1940 },
  { x: 1550, y: 608, vida: 20, left: 1600, right: 1940 },
  {
    x: 2300, y: 480, vida: 30, left: 2120, right: 2440,
    tipo: 'dron', speed: 60, detection: 320, damage: 20,
  },
  { x: 3240, y: 416, vida: 20, left: 3200, right: 3290 },
]

function bodyBounds(enemy, x = enemy.x, y = enemy.y) {
  if (enemy.tipo === 'dron') {
    return { left: x - 16, right: x + 16, top: y - 14, bottom: y + 14 }
  }
  // The scarab body is 44x24 at 1.5x scale with its configured offset.
  return { left: x - 30, right: x + 36, top: y - 12, bottom: y + 24 }
}

function hasSolidTile(column, row) {
  return (SOLID_ROWS.get(row) || []).some(([start, end]) => column >= start && column <= end)
}

function intersectsGround(enemy, x = enemy.x, y = enemy.y) {
  const bounds = bodyBounds(enemy, x, y)
  const firstColumn = Math.floor(bounds.left / TILE_SIZE)
  const lastColumn = Math.floor((bounds.right - 0.001) / TILE_SIZE)
  const firstRow = Math.floor(bounds.top / TILE_SIZE)
  const lastRow = Math.floor((bounds.bottom - 0.001) / TILE_SIZE)
  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      if (hasSolidTile(column, row)) return true
    }
  }
  return false
}

function supportedByGround(enemy) {
  const bounds = bodyBounds(enemy)
  const row = Math.floor((bounds.bottom + 1) / TILE_SIZE)
  const firstColumn = Math.floor(bounds.left / TILE_SIZE)
  const lastColumn = Math.floor((bounds.right - 0.001) / TILE_SIZE)
  for (let column = firstColumn; column <= lastColumn; column += 1) {
    if (hasSolidTile(column, row)) return true
  }
  return false
}

function hasFloorAhead(enemy, direction) {
  const bounds = bodyBounds(enemy)
  const x = direction > 0 ? bounds.right + 5 : bounds.left - 5
  const row = Math.floor((bounds.bottom + 4) / TILE_SIZE)
  return hasSolidTile(Math.floor(x / TILE_SIZE), row)
}

function moveEnemy(enemy, deltaSeconds) {
  const oldX = enemy.x
  const nextX = oldX + enemy.vx * deltaSeconds
  if (intersectsGround(enemy, nextX, enemy.y)) {
    enemy.x = oldX
    enemy.vx = 0
    enemy.blockedX = true
  } else {
    enemy.x = nextX
    enemy.blockedX = false
  }

  if (enemy.tipo === 'dron') return

  const oldY = enemy.y
  enemy.vy = Math.min(900, enemy.vy + GRAVITY * deltaSeconds)
  const nextY = oldY + enemy.vy * deltaSeconds
  if (intersectsGround(enemy, enemy.x, nextY)) {
    if (enemy.vy >= 0) {
      const bounds = bodyBounds(enemy, enemy.x, nextY)
      const firstColumn = Math.floor(bounds.left / TILE_SIZE)
      const lastColumn = Math.floor((bounds.right - 0.001) / TILE_SIZE)
      let surface = Infinity
      for (let row = Math.floor((bodyBounds(enemy, enemy.x, oldY).bottom - 0.001) / TILE_SIZE);
        row <= Math.floor(bounds.bottom / TILE_SIZE); row += 1) {
        for (let column = firstColumn; column <= lastColumn; column += 1) {
          if (hasSolidTile(column, row)) surface = Math.min(surface, row * TILE_SIZE)
        }
      }
      enemy.y = Number.isFinite(surface) ? surface - 24 : oldY
      enemy.vy = 0
    } else {
      enemy.y = oldY
      enemy.vy = 0
    }
  } else {
    enemy.y = nextY
  }
}

function livingPlayers(playerStates) {
  return Object.entries(playerStates || {})
    .filter(([, state]) => state && Number.isFinite(Number(state.x)) && Number.isFinite(Number(state.y)) && !state.dead)
    .map(([id, state]) => ({ id, x: Number(state.x), y: Number(state.y) }))
}

function nearestPlayer(enemy, players) {
  let nearest = null
  let nearestDistance = Infinity
  for (const player of players) {
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if (distance < nearestDistance) {
      nearest = player
      nearestDistance = distance
    }
  }
  return nearest ? { ...nearest, distance: nearestDistance } : null
}

function beginAttack(enemy, target, now) {
  enemy.attackingUntil = now + enemy.attackLockMs
  enemy.fireAt = now + enemy.fireDelay
  enemy.fireTargetId = target.id
  enemy.nextAttackAt = now + enemy.attackCooldown
}

function fireProjectile(world, enemy, playerStates, now) {
  const targetState = playerStates[enemy.fireTargetId]
  if (!targetState || targetState.dead) return

  let frame = null
  let muzzleY = 10
  let muzzleX = 10
  let speed = 350
  let lifetime = 3000
  let texture = 'enemy2Bullet'
  let scale = 1
  const direction = Number(targetState.x) < enemy.x ? -1 : 1

  if (enemy.tipo === 'dron') {
    const differenceY = Number(targetState.y) - enemy.y
    frame = differenceY < -32 ? 2 : differenceY > 32 ? 1 : 0
    muzzleY = frame === 2 ? -16 : frame === 1 ? 1 : -3
    muzzleX = 14
    speed = 320
    lifetime = 2600
    texture = 'enemyDronBullet'
    scale = 2
  }

  const x = enemy.x + muzzleX * direction
  const y = enemy.y + muzzleY
  const targetX = Number(targetState.x)
  const targetY = Number(targetState.y)
  const length = Math.max(1, Math.hypot(targetX - x, targetY - y))
  world.projectiles.push({
    id: `${enemy.id}-${++world.projectileSequence}`,
    enemyId: enemy.id,
    texture,
    scale,
    x,
    y,
    vx: ((targetX - x) / length) * speed,
    vy: ((targetY - y) / length) * speed,
    damage: enemy.damage,
    expiresAt: now + lifetime,
    frame,
  })
  enemy.fireAt = 0
}

function updateEnemy(world, enemy, players, playerStates, now, deltaSeconds) {
  if (enemy.health <= 0) {
    enemy.vx = 0
    enemy.attackingUntil = 0
    enemy.targetId = null
    return
  }

  const target = nearestPlayer(enemy, players)
  const directionToTarget = target ? (target.x < enemy.x ? -1 : 1) : enemy.direction
  const detected = target && target.distance <= enemy.detection
  enemy.targetId = detected ? target.id : null
  let desiredDirection = 0

  if (enemy.tipo === 'dron' && detected) {
    enemy.aimFrame = target.y - enemy.y < -32 ? 2 : target.y - enemy.y > 32 ? 1 : 0
    enemy.direction = directionToTarget
    enemy.flipX = directionToTarget > 0
  } else if (detected && target) {
    enemy.direction = directionToTarget
    enemy.flipX = directionToTarget > 0
    if (target.distance <= enemy.attackRange && Math.abs(target.y - enemy.y) <= enemy.sameLevelTolerance && now >= enemy.nextAttackAt) {
      beginAttack(enemy, target, now)
    }
    if (Math.abs(target.x - enemy.x) > enemy.marginePersecucionX) desiredDirection = directionToTarget
  } else {
    if (enemy.x <= enemy.leftLimit) enemy.direction = 1
    else if (enemy.x >= enemy.rightLimit) enemy.direction = -1
    else if (enemy.blockedX) enemy.direction *= -1

    if (
      enemy.tipo !== 'dron' &&
      supportedByGround(enemy) &&
      !hasFloorAhead(enemy, enemy.direction)
    ) enemy.direction *= -1
    desiredDirection = enemy.direction
    enemy.flipX = enemy.direction > 0
  }

  if (enemy.tipo === 'dron' && detected) {
    enemy.vx = 0
    if (target && now >= enemy.nextAttackAt) beginAttack(enemy, target, now)
  } else {
    if (desiredDirection && enemy.tipo !== 'dron' && supportedByGround(enemy) && !hasFloorAhead(enemy, desiredDirection)) {
      desiredDirection = 0
    }
    enemy.vx = desiredDirection * enemy.speed
  }

  if (enemy.fireAt && now >= enemy.fireAt) fireProjectile(world, enemy, playerStates, now)
  moveEnemy(enemy, deltaSeconds)
}

function updateProjectiles(world, players, now, deltaSeconds) {
  const hits = []
  const survivors = []
  for (const projectile of world.projectiles) {
    projectile.x += projectile.vx * deltaSeconds
    projectile.y += projectile.vy * deltaSeconds
    if (now >= projectile.expiresAt || hasSolidTile(Math.floor(projectile.x / TILE_SIZE), Math.floor(projectile.y / TILE_SIZE))) {
      continue
    }

    const target = players.find((player) => Math.abs(player.x - projectile.x) <= 28 && Math.abs(player.y - projectile.y) <= 28)
    if (target) {
      hits.push({ playerId: target.id, damage: projectile.damage })
      continue
    }
    survivors.push(projectile)
  }
  world.projectiles = survivors
  return hits
}

/** @param {number} [startedAt] */
/** @returns {Level6Simulation} */
export function createLevel6Simulation(startedAt = Date.now()) {
  /** @type {Record<string, Level6Enemy>} */
  const enemies = {}
  ENEMY_DEFINITIONS.forEach((definition, index) => {
    const id = `enemy-${index}`
    enemies[id] = {
      id,
      x: definition.x,
      y: definition.y,
      vx: 0,
      vy: 0,
      health: definition.vida,
      maxHealth: definition.vida,
      speed: definition.speed || 50,
      leftLimit: definition.left,
      rightLimit: definition.right,
      direction: 1,
      flipX: false,
      tipo: definition.tipo || 'escarabajo',
      detection: definition.detection || 280,
      attackRange: 200,
      damage: definition.damage || 20,
      sameLevelTolerance: 32,
      marginePersecucionX: 8,
      attackLockMs: definition.tipo === 'dron' ? 600 : 900,
      attackCooldown: definition.tipo === 'dron' ? 1500 : 1500,
      fireDelay: definition.tipo === 'dron' ? 180 : 280,
      attackingUntil: 0,
      nextAttackAt: startedAt,
      fireAt: 0,
      fireTargetId: null,
      targetId: null,
      aimFrame: null,
      blockedX: false,
    }
  })

  return {
    startedAt,
    lastTickAt: startedAt,
    sequence: 0,
    projectileSequence: 0,
    enemies,
    projectiles: [],
  }
}

/**
 * Advance the authoritative Level 6 world and return enemy projectile hits.
 * @param {ReturnType<typeof createLevel6Simulation>} world
 * @param {Record<string, {x:number,y:number,dead?:boolean}>} playerStates
 * @param {number} now
 */
export function tickLevel6Simulation(world, playerStates, now = Date.now()) {
  const deltaSeconds = Math.min(0.1, Math.max(0.001, (now - world.lastTickAt) / 1000))
  world.lastTickAt = now
  const players = livingPlayers(playerStates)
  Object.values(world.enemies).forEach((enemy) => {
    updateEnemy(world, enemy, players, playerStates, now, deltaSeconds)
  })
  return updateProjectiles(world, players, now, deltaSeconds)
}

/** @param {Level6Simulation|null} world */
export function setLevel6EnemyHealth(world, enemyId, health) {
  const enemy = world?.enemies?.[enemyId]
  if (!enemy || !Number.isFinite(Number(health))) return false
  enemy.health = Math.max(0, Math.min(enemy.maxHealth, Number(health)))
  return true
}

/** @param {Level6Simulation} world */
/** @returns {Level6Snapshot} */
export function createLevel6Snapshot(world, now = Date.now()) {
  world.sequence += 1
  const enemies = {}
  Object.values(world.enemies).forEach((enemy) => {
    enemies[enemy.id] = {
      x: enemy.x,
      y: enemy.y,
      vx: enemy.vx,
      vy: enemy.vy,
      flipX: enemy.flipX,
      moving: Math.abs(enemy.vx) > 1 || Math.abs(enemy.vy) > 1,
      attacking: enemy.attackingUntil > now,
      targetId: enemy.targetId,
      frame: enemy.aimFrame,
      health: enemy.health,
    }
  })
  return {
    sequence: world.sequence,
    sentAt: now,
    enemies,
    projectiles: world.projectiles.map(({ id, enemyId, texture, scale, x, y, vx, vy }) => ({
      id, enemyId, texture, scale, x, y, vx, vy,
    })),
    defeatedEnemyIds: Object.values(world.enemies).filter((enemy) => enemy.health <= 0).map((enemy) => enemy.id),
  }
}
