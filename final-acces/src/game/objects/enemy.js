import Phaser from "phaser";

class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture);

        this.vida = 100;
        this.velocidad = 100;
        this.daño = 20;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        }

        mover() {

            
        }






    }