import { useGameStore } from "@/stores/game.js";

/**
 * Repository para gestionar el estado del juego.
 * SRP: unica responsabilidad es manejar estado persistido.
 * DIP: las escenas y entidades dependen de esta abstraccion.
 */
export default class GameRepository {

    constructor() {
        this._vidas = 5;
        this._llaves = 0;
        this._enemigos = 0;
        this._store = useGameStore();
    }

    get vidas() {
        return this._vidas;
    }

    set vidas(value) {
        this._vidas = value;
        this._store.vidas = value;
    }

    get llaves() {
        return this._llaves;
    }

    set llaves(value) {
        this._llaves = value;
        this._store.llaves = value;
    }

    get enemigos() {
        return this._enemigos;
    }

    set enemigos(value) {
        this._enemigos = value;
        this._store.enemigos = value;
    }

    incrementarEnemigos() {
        this._enemigos++;
        this._store.enemigos = this._enemigos;
    }

    reset() {
        this._vidas = 5;
        this._llaves = 0;
        this._enemigos = 0;
        this._store.vidas = this._vidas;
        this._store.llaves = this._llaves;
        this._store.enemigos = this._enemigos;
    }
}
