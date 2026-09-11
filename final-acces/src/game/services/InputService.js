import Phaser from "phaser";

/**
 * Encapsula toda la entrada de teclado.
 * Principio SRP: unica responsabilidad es gestionar entradas.
 * Principio DIP: los controllers dependen de esta abstraccion.
 */
export default class InputService {

    constructor(scene) {
        this.scene = scene;

        this._keys = scene.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
            L: Phaser.Input.Keyboard.KeyCodes.L,
            G: Phaser.Input.Keyboard.KeyCodes.G,
        });
    }

    isMovingLeft() {
        return this._keys.A.isDown;
    }

    isMovingRight() {
        return this._keys.D.isDown;
    }

    isJumping() {
        return this._keys.SPACE.isDown || this._keys.W.isDown;
    }

    isAttacking() {
        return Phaser.Input.Keyboard.JustDown(this._keys.L);
    }

    isInteracting() {
        return Phaser.Input.Keyboard.JustDown(this._keys.G);
    }

    getKey(keyCode) {
        return this._keys[keyCode];
    }
}
