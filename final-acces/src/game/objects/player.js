import Phaser from "phaser";

class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture);

        this.vida = 100;
        this.velocidad = 200;
        this.daño = 20;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.teclas = scene.input.keyboard.addKeys({

            izquierda: Phaser.Input.Keyboard.KeyCodes.A,
            derecha: Phaser.Input.Keyboard.KeyCodes.D,
            saltar: Phaser.Input.Keyboard.KeyCodes.SPACE

        });
    }

    mover() {

        if (this.teclas.izquierda.isDown) {
            
            this.setVelocityX(-this.velocidad);

        }

        else if (this.teclas.derecha.isDown) {
            
            this.setVelocityX(this.velocidad);

        }

        else {

            this.setVelocityX(0);

        }

        
        if (this.teclas.saltar.isDown && this.body.blocked.down) {

            this.setVelocityY(-500);

        }

    }

}

export default Player;