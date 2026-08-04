import Phaser from "phaser";
import AttackHitbox from "./attackHitbox.js";

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
        this.recibiendoDaño = false;

        //Inventario de la llave
        this.llaves = [];

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(false);



        this.teclas = scene.input.keyboard.addKeys({

            izquierda: Phaser.Input.Keyboard.KeyCodes.A,
            derecha: Phaser.Input.Keyboard.KeyCodes.D,
            saltar: Phaser.Input.Keyboard.KeyCodes.SPACE,
            atacar: Phaser.Input.Keyboard.KeyCodes.L

        });
    }

    mover() {

        if (this.recibiendoDaño) {
            return;
        }

        if (this.muerto) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclas.atacar)
        ){
            this.atacar();
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
                //this.play("caminar", true);
                const anim = this.scene.anims.get("caminar");

                if (!anim) {
                    console.error("No existe la animación caminar");
                } else {
                    this.play("caminar", true);
                }
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

            this.play("saltar", true);

        }


    }


atacar() {

    if (this.ataque || this.recibiendoDaño || this.muerto) {
        return;
    }

    this.setVelocityX(0);

    this.ataque = true;

    this.play("atacar");

    const offsetX = this.flipX ? -30 : 30;

    const hitbox = new AttackHitbox(
        this.scene,
        this.x + offsetX,
        this.y,
        40,
        30,
        this.daño,
        this
    );

    this.scene.physics.add.overlap(

        hitbox,

        this.scene.enemies,

        (hitbox, enemigo) => {

            enemigo.recibirDaño(hitbox.damage);

            hitbox.destroy();

        }

    );

      this.scene.physics.add.overlap(

      hitbox,

      this.scene.boxes,

      (hitbox, caja) => {

          caja.romper();

      }

  );


}
recogerLlave(llave) {

    this.llaves.push({
        texture:llave.texture.key,
        grupo: llave.grupo,
        color: llave.color,
        efecto: llave.efecto,
        correcta: llave.correcta
    });

    console.log("Inventario:", this.llaves);

    llave.destroy();
}

recibirDaño(daño) {

    if (this.muerto || this.recibiendoDaño) return;
    this.ataque = false;
    this.vida -= daño;

    if (this.vida <= 0) {

        this.vida = 0;
        this.muerto = true;

        this.setVelocity(0,0);

        this.play("playerDie");

    }
    else {

        this.recibiendoDaño = true;

        this.setVelocity(0,0);

        this.play("playerDamage");

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
        this.recibiendoDaño = false;
        this.ataque = false;
    }


}

export default Player;
