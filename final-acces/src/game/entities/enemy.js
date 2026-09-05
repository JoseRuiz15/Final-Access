import Phaser from "phaser";
import Projectile from "../factories/projectile";
import { useGameStore } from "@/stores/game.js";

class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture);

        this.setScale(1.5);

        this.vida = 40;
        this.velocidad = 50;
        this.daño = 20;

        this.direccion = 1;

        this.atacando = false;
        this.puedeDisparar = true;
        this.recibiendoDaño = false;
        this.muerto = false;
        this.gameStore = useGameStore();

        this.limiteIzquierdo = 670;
        this.limiteDerecho = 1100;


        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
    }

    mover() {

    if (this.muerto) {
        this.setVelocity(0);
        return;
    }

    if (this.recibiendoDaño) {
        this.setVelocity(0);
        return;
    }

    if (this.atacando) {
        this.setVelocity(0);
        return;
    }

    if (!this.scene.player || !this.scene.player.active) {
        return;
    }


      if (this.recibiendoDaño) {
          this.setVelocityX(0);
          return;
      }

        if (this.muerto) {
        this.setVelocity(0);
        return;
    }
         if (!this.scene.player || !this.scene.player.active) {

            this.setVelocityX(this.velocidad * this.direccion);

            this.setFlipX(this.direccion === 1);

            if(this.body.blocked.right) {
                this.direccion = -1;
            }

            return;
         }
        const distancia = Phaser.Math.Distance.Between(
                this.x,
                this.y,
                this.scene.player.x,
                this.scene.player.y
        );

        if (!this.anims.isPlaying) {
            this.play("enemyWalk", true);
        }

        if(distancia < 100) {
            this.setVelocityX(0);

            if(!this.anims.isPlaying || this.anims.currentAnim.key !== "enemyAttack") {
            this.play("enemyAttack", true);
         }
            this.atacar();
            return;
        }else {

            this.setVelocityX(this.velocidad);

            this.play("enemyWalk", true);
        }

        if (distancia < 10) {


        if (this.scene.player.x < this.x) {

            if (this.x > this.limiteIzquierdo) {
                this.setVelocityX(-this.velocidad);
            } else {
                this.setVelocityX(0);
            }

        } else {

            if (this.x < this.limiteDerecho) {
                this.setVelocityX(this.velocidad);
            } else {
                this.setVelocityX(0);
            }
        }
            return;
        }


        // Mover al enemigo
        this.setVelocityX(this.velocidad * this.direccion);

        // Siempre mirar hacia donde se mueve
        this.setFlipX(this.direccion === 1);
        if (this.x <= this.limiteIzquierdo) {
            this.direccion = 1;
        }

        if (this.x >= this.limiteDerecho) {
            this.direccion = -1;
        }


        // Cambiar de dirección al chocar
        if (this.body.blocked.right) {
            this.direccion = -1;
        }

        if (this.body.blocked.left) {
            this.direccion = 1;
        }
    }
recibirDaño(daño) {

    if (this.muerto || this.recibiendoDaño) return;

    this.vida -= daño;

    if (this.vida <= 0) {

        this.vida = 0;
        this.muerto = true;
        this.setVelocity(0);
        this.body.enable = false;

        this.scene.mostrarExplosion(this.x, this.y);
        this.destroy();

        this.gameStore.enemigos++;

    } else {

        this.recibiendoDaño = true;
        this.setVelocity(0);
        this.play("enemyDamage");

    }

}

        //ataque del enemigo
      atacar() {

          if (this.atacando || this.muerto || this.recibiendoDaño)
              return;

          if (!this.puedeDisparar)
              return;

          this.atacando = true;
          this.puedeDisparar = false;

          this.play("enemyAttack");

          const direccion =
              this.scene.player.x < this.x ? -1 : 1;

          const bala = new Projectile(

              this.scene,
              this.x,
              this.y,
              "proyectile"

          );

          bala.disparar(direccion);

          this.scene.physics.add.overlap(

              bala,

              this.scene.player,

              (bala, player) => {

                  player.recibirDaño(this.daño);

                  bala.destroy();

              }

          );

          this.scene.time.delayedCall(800, () => {

              this.atacando = false;

          });

          this.scene.time.delayedCall(1500, () => {

              this.puedeDisparar = true;

          });

      }


}

export default Enemy;
