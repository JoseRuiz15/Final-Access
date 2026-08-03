import Phaser from "phaser";
import attack from "./attack.js";

class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture);

        this.setDisplaySize(48, 48);
        this.vida = 100;
        this.velocidad = 160;
        this.daño = 20;

        this.ataque = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);



        this.teclas = scene.input.keyboard.addKeys({

            izquierda: Phaser.Input.Keyboard.KeyCodes.A,
            derecha: Phaser.Input.Keyboard.KeyCodes.D,
            saltar: Phaser.Input.Keyboard.KeyCodes.SPACE,
            atacar: Phaser.Input.Keyboard.KeyCodes.L

        });
    }

    mover() {

        if(this.ataque){

            return;

        }

        
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

         if (this.body.blocked.down && !this.ataque) {
            this.setTexture("player");
        }
        }


        if (this.teclas.saltar.isDown && this.body.blocked.down) {

            this.setVelocityY(-500);

            this.play("saltar", true);

        }

        if (!this.body.blocked.down && !this.ataque) {

            this.play("saltar", true)

        }

        if (Phaser.Input.Keyboard.JustDown(this.teclas.atacar)
        ){
            this.atacar();
        }
    }


    atacar() {

        this.ataque = true;

        this.setVelocityX(0);

        this.play("atacar");

        let offsetX;

    if (this.flipX) {

        offsetX = -35;

    } else {

        offsetX = 35;

    }

    const ataque = new attack(

        this.scene,
        this.x + offsetX,
        this.y,
        40,
        30

    );

    }


}

export default Player;
