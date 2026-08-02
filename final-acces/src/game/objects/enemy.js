import Phaser from "phaser";

class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture);

        this.vida = 50;
        this.velocidad = 100;
        this.daño = 20;
        this.direccion = 1;
        this.velocidad = 100;
        this.daño = 20;
        this.atacando = false;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
    }

    create() {

    this.enemigo = new Enemy(this, 500, 300, "enemy");

}

    mover() {
        const distancia = Phaser.Math.Distance.Between(
                this.x,
                this.y, 
                this.scene.player.x,
                this.scene.player.y
        );

        if (this.anims.currentAnim?.key !== "enemyWalk") {
            this.play("enemyWalk", true);
        }

        if(distancia < 20) {
            this.setVelocityX(0);
            this.atacar();
            return;
        }

        if (distancia < 250) {
            if (this.scene.player.x < this.x) {
                this.setVelocityX(-this.velocidad);
                this.setFlipX(false);
            } else {

                this.setVelocityX(this.velocidad);
                this.setFlipX(true);
            }
            return;
        }

    
        // Mover al enemigo
        this.setVelocityX(this.velocidad * this.direccion);

        // Siempre mirar hacia donde se mueve
        this.setFlipX(this.direccion === 1);

        // Cambiar de dirección al chocar
        if (this.body.blocked.right) {
            this.direccion = -1;
        }

        if (this.body.blocked.left) {
            this.direccion = 1;
        }
    }
    recibirDaño(daño) {

        this.vida -= daño;

        if (this.vida <= 0) {
            this.destroy();
        }

    }

    atacar() {
        if (this.atacando) return;

        this.atacando = true;

        console.log("ataque");

        this.scene.player.vida -= this.daño;

        
        this.scene.time.delayedCall(800, () => {

            this.atacando =  false;
        });
    }
    
}

export default Enemy;

