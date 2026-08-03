import Phaser from "phaser";
import attack from "./attack.js";

class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture);
        
        this.spawnX = x;
        this.spawnY = y;

        this.setDisplaySize(48, 48);
        this.vida = 100;
        this.velocidad = 160;
        this.daño = 20;

        this.ataque = false;
        this.muerto = false;

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

        if (this.muerto) {
            return;
        }

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

         if (this.body.blocked.down && !this.ataque && !this.muerto) {
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

    // Evita iniciar otro ataque si ya está atacando
    if (this.ataque) return;

    this.ataque = true;

    this.play("atacar");

    let offsetX = this.flipX ? -30 : 30;

    const hitbox = this.scene.add.zone(
        this.x + offsetX,
        this.y,
        40,
        30
    );

    this.scene.physics.add.existing(hitbox);

    hitbox.body.setAllowGravity(false);

    // Hacer daño al enemigo
    this.scene.physics.add.overlap(
        hitbox,
        this.scene.enemy,
        (hitbox, enemigo) => {

            enemigo.recibirDaño(this.daño);

            hitbox.destroy();

        },
        null,
        this
    );

    // Destruir el hitbox después de un momento
    this.scene.time.delayedCall(150, () => {

        if (hitbox.active) {
            hitbox.destroy();
        }

    });

}
    recibirDaño(daño) {

        this.vida -= daño;

        console.log("vida de jugador:", this.vida);

        if (this.vida <= 0) {

            this.vida = 0;

            this.muerto = true;

           this.setVelocity(0, 0);

           this.play("playerDie");
        }
    }

    respawn() {
        this.vida = 100;
        
        this.setPosition(this.spawnX, this.spawnY);

        this.setVelocity(0, 0);

        this.setActive(true);

        this.setVisible(true);

        this.body.enable = true;

        this.setTexture("player");

        this.muerto = false;
    }


}

export default Player;
