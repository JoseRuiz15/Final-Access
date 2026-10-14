export default class IMovable {
  moverIzquierda() {
    throw new Error('Method "moverIzquierda()" must be implemented.')
  }
  moverDerecha() {
    throw new Error('Method "moverDerecha()" must be implemented.')
  }
  detenerMovimiento() {
    throw new Error('Method "detenerMovimiento()" must be implemented.')
  }
  saltar() {
    throw new Error('Method "saltar()" must be implemented.')
  }
}
