import { getRulesByNames } from './collisionRules/index.js'

export default class CollisionSetup {
  static setup(physicsService, entities, config = {}) {
    const ruleNames = config.collisionRules || [
      'PlayerGroundRule',
      'EnemyGroundRule',
      'BoxGroundRule',
      'BoxBoxRule',
      'PlayerBoxRule',
      'KeyGroundRule',
      'ProjectilePlayerRule',
    ]

    const rules = getRulesByNames(ruleNames)
    rules.forEach((RuleClass) => new RuleClass().setup(physicsService, entities))
  }
}
