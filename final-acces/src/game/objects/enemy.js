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

        if(distancia < 20) {
            this.setVelocityX(0);
            this.atacar();
            return;
        }

        if (distancia < 250) {
            if (this.scene.player.x < this.x) {
                this.setVelocityX(-this.velocidad);
                this.setFlipX(true);
            } else {

                this.setVelocityX(this.velocidad);
                this.setFlipX(false);
            }
            return;
        }

        this.setVelocityX(this.velocidad * this.direccion);

        if (this.body.blocked.right) {
            this.direccion = -1;
            this.setFlipX(true);
        }

        if (this.body.blocked.left) {
            this.direccion = 1;
            this.setFlipX(false);
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