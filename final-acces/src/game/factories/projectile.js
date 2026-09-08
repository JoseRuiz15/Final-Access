import Phaser from "phaser";

class Projectile extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture); 
        console.log("disparo");

        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.body.setAllowGravity(false);

        this.velocidad =350;
    }

    disparar(direccion) {

        this.play("proyectile", true);

        this.setVelocityX(direccion * this.velocidad);

        if (direccion < 0) {
            this.setFlipX(true);
        }else {
            this.setFlipX(false);
        }

    }

    atacar(){
        this.scene.player.vida -= this.daño;
    }

}

export default Projectile;