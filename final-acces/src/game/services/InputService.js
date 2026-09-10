import Phaser from "phaser";

/**
 * Encapsula toda la entrada de teclado.
 * Principio SRP: unica responsabilidad es gestionar entradas.
 * Principio DIP: los controllers dependen de esta abstraccion.
 */
export default class InputService {

    constructor(scene) {
        this.scene = scene;

        this.keys = scene.input.keyboard.addKeys({
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
        return this.keys.A.isDown;
    }

    isMovingRight() {
        return this.keys.D.isDown;
    }

    isJumping() {
        return this.keys.SPACE.isDown || this.keys.W.isDown;
    }

    isAttacking() {
        return Phaser.Input.Keyboard.JustDown(this.keys.L);
    }

    isInteracting() {
        return Phaser.Input.Keyboard.JustDown(this.keys.G);
    }

    getKey(keyCode) {
        return this.keys[keyCode];
    }
}
