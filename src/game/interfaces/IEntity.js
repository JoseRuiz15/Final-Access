export default class IEntity {
  getPosition() {
    throw new Error('Method "getPosition()" must be implemented.')
  }
  getHealth() {
    throw new Error('Method "getHealth()" must be implemented.')
  }
  isAlive() {
    throw new Error('Method "isAlive()" must be implemented.')
  }
  takeDamage(_amount) {
    throw new Error('Method "takeDamage(amount)" must be implemented.')
  }
  update(_delta) {
    throw new Error('Method "update(delta)" must be implemented.')
  }
  getTexture() {
    throw new Error('Method "getTexture()" must be implemented.')
  }
  getType() {
    throw new Error('Method "getType()" must be implemented.')
  }
  break() {
    throw new Error('Method "break()" must be implemented.')
  }
  pickUp(_player) {
    throw new Error('Method "pickUp(player)" must be implemented.')
  }
}
