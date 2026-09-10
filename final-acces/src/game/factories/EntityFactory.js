import Player from "../entities/player.js";
import Enemy from "../entities/enemy.js";
import Box from "../entities/box.js";
import Key from "../entities/key.js";

/**
 * Factory central para crear entidades del juego.
 * Principio OCP: para agregar nuevos tipos, se agrega un metodo nuevo
 * sin modificar codigo existente.
 * Principio SRP: unica responsabilidad es crear entidades.
 */
export default class EntityFactory {

    /**
     * Crea un jugador.
     * @param {Phaser.Scene} scene - Escena Phaser
     * @param {number} x - Posicion X
     * @param {number} y - Posicion Y
     * @param {string} texture - Key de textura
     * @returns {Player}
     */
    static createPlayer(scene, x, y, texture) {
        return new Player(scene, x, y, texture);
    }

    /**
     * Crea un enemigo generico.
     * @param {Phaser.Scene} scene - Escena Phaser
     * @param {number} x - Posicion X
     * @param {number} y - Posicion Y
     * @param {string} texture - Key de textura
     * @param {object} config - Configuracion opcional
     * @returns {Enemy}
     */
    static createEnemy(scene, x, y, texture, config = {}) {
        const enemy = new Enemy(scene, x, y, texture);
        if (config.vida) enemy.vida = config.vida;
        if (config.velocidad) enemy.velocidad = config.velocidad;
        if (config.limiteIzquierdo) enemy.limiteIzquierdo = config.limiteIzquierdo;
        if (config.limiteDerecho) enemy.limiteDerecho = config.limiteDerecho;
        return enemy;
    }

    /**
     * Crea una caja.
     * @param {Phaser.Scene} scene - Escena Phaser
     * @param {number} x - Posicion X
     * @param {number} y - Posicion Y
     * @param {object|null} keyData - Datos de llave opcional
     * @returns {Box}
     */
    static createBox(scene, x, y, keyData = null) {
        return new Box(scene, x, y, keyData);
    }

    /**
     * Crea una llave.
     * @param {Phaser.Scene} scene - Escena Phaser
     * @param {number} x - Posicion X
     * @param {number} y - Posicion Y
     * @param {string} texture - Key de textura
     * @param {object} datos - Datos de la llave
     * @returns {Key}
     */
    static createKey(scene, x, y, texture, datos) {
        return new Key(scene, x, y, texture, datos);
    }

    /**
     * Enemigo tipo patrullero (rapido, poca vida).
     * Principio OCP: nuevo tipo sin tocar codigo existente.
     */
    static createPatrolEnemy(scene, x, y, texture) {
        return EntityFactory.createEnemy(scene, x, y, texture, {
            vida: 20,
            velocidad: 60,
        });
    }

    /**
     * Enemigo tipo tanque (lento, mucha vida).
     */
    static createTankEnemy(scene, x, y, texture) {
        return EntityFactory.createEnemy(scene, x, y, texture, {
            vida: 60,
            velocidad: 30,
        });
    }
}
