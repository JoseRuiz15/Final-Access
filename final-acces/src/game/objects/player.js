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

        //const estabaEnElAire = !this.body.blocked.down;

        if (this.teclas.izquierda.isDown) {
            
            this.setVelocityX(-this.velocidad);

            this.setFlipX(true);

            if (this.body.blocked.down) {
                this.play("caminar", true);
            }

        }

        else if (this.teclas.derecha.isDown) {
            
            this.setVelocityX(this.velocidad);

            this.setFlipX(false);

            if (this.body.blocked.down) {
                this.play("caminar", true);
            }

        }

        else {

            this.setVelocityX(0);

         if (this.body.blocked.down) {
            this.setTexture("player");
        }
        }

        
        if (this.teclas.saltar.isDown && this.body.blocked.down) {

            this.setVelocityY(-500);

            this.play("saltar", true);

        }

        if (!this.body.blocked.down) {

            this.play("saltar", true)

        }
    }

       
}

export default Player;