import PlayerGroundRule from './PlayerGroundRule.js'
import EnemyGroundRule from './EnemyGroundRule.js'
import BoxGroundRule from './BoxGroundRule.js'
import BoxBoxRule from './BoxBoxRule.js'
import PlayerBoxRule from './PlayerBoxRule.js'
import KeyGroundRule from './KeyGroundRule.js'
import ProjectilePlayerRule from './ProjectilePlayerRule.js'

export const COLLISION_RULES = {
  PlayerGroundRule,
  EnemyGroundRule,
  BoxGroundRule,
  BoxBoxRule,
  PlayerBoxRule,
  KeyGroundRule,
  ProjectilePlayerRule,
}

export function getRulesByNames(names) {
  return names.map((name) => COLLISION_RULES[name]).filter(Boolean)
}
