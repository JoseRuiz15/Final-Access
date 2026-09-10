import Phaser from "phaser";

/**
 * Clase base abstracta para entidades del juego.
 * Player y Enemy la extienden cuando necesitan herencia,
 * o implementan IEntity directamente usando Phaser.Physics.Arcade.Sprite.
 *
 * Principio OCP: Para nuevos tipos de entidades, crear subclases de Entity
 * sin modificar código existente.
 */
export default class Entity extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;
        this._x = x;
        this._y = y;
        this._health = 100;
    }

    /**
     * @returns {{x: number, y: number}}
     */
    getPosition() {
        return { x: this._x, y: this._y };
    }

    /**
     * @returns {number}
     */
    getHealth() {
        return this._health;
    }

    /**
     * @returns {boolean}
     */
    isAlive() {
        return this._health > 0;
    }

    /**
     * @param {number} amount
     * @returns {boolean} true si murio
     */
    takeDamage(amount) {
        this._health -= amount;
        if (this._health < 0) {
            this._health = 0;
        }
        return this._health <= 0;
    }

    /**
     * @param {number} _delta
     */
    update(_delta) {}

    /**
     * @returns {Phaser.Textures.Texture}
     */
    getTexture() {
        return this.texture;
    }

    /**
     * @returns {string}
     */
    getType() {
        return "entity";
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    setPosition(x, y) {
        this._x = x;
        this._y = y;
    }

    resetPosition() {
        this._health = 100;
    }

    getDamage() {
        return 10;
    }
}
