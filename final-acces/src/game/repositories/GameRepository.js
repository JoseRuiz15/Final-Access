/**
 * Repository para gestionar el estado del juego.
 * Principio SRP: unica responsabilidad es manejar estado persistido.
 * Principio DIP: las escenas y entidades dependen de esta abstraccion.
 */
export default class GameRepository {

    constructor() {
        this._vidas = 5;
        this._llaves = 0;
        this._enemigos = 0;
    }

    get vidas() {
        return this._vidas;
    }

    set vidas(value) {
        this._vidas = value;
    }

    get llaves() {
        return this._llaves;
    }

    set llaves(value) {
        this._llaves = value;
    }

    get enemigos() {
        return this._enemigos;
    }

    set enemigos(value) {
        this._enemigos = value;
    }

    reset() {
        this._vidas = 5;
        this._llaves = 0;
        this._enemigos = 0;
    }
}
