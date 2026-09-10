export default class ISceneContract {
  preload(){throw new Error('Method "preload()" must be implemented.');}
  create(){throw new Error('Method "create()" must be implemented.');}
  update(_delta){throw new Error('Method "update(delta)" must be implemented.');}
  onPlayerDeath(){};
  onEnemyDied(){};
}
