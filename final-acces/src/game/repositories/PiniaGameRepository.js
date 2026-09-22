import IGameRepository from '../interfaces/IGameRepository.js'
import { useGameStore } from '@/stores/game.js'

export default class PiniaGameRepository extends IGameRepository {
  constructor() {
    super()
    this._store = useGameStore()
  }

  get vidas() {
    return this._store.vidas
  }

  set vidas(value) {
    this._store.vidas = value
  }

  get llaves() {
    return this._store.llaves
  }

  set llaves(value) {
    this._store.llaves = value
  }

  get enemigos() {
    return this._store.enemigos
  }

  set enemigos(value) {
    this._store.enemigos = value
  }

  incrementarEnemigos() {
    this._store.enemigos++
  }

  reset() {
    this._store.vidas = 5
    this._store.llaves = 0
    this._store.enemigos = 0
  }
}
