export default class IGameRepository {
  get vidas() {
    throw new Error('Getter "vidas" must be implemented.')
  }
  set vidas(value) {
    throw new Error('Setter "vidas" must be implemented.')
  }

  get llaves() {
    throw new Error('Getter "llaves" must be implemented.')
  }
  set llaves(value) {
    throw new Error('Setter "llaves" must be implemented.')
  }

  get enemigos() {
    throw new Error('Getter "enemigos" must be implemented.')
  }
  set enemigos(value) {
    throw new Error('Setter "enemigos" must be implemented.')
  }

  incrementarEnemigos() {
    throw new Error('Method "incrementarEnemigos()" must be implemented.')
  }
  reset() {
    throw new Error('Method "reset()" must be implemented.')
  }
}
