import Phaser from "phaser";

class Key extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, correcta = false) {

        super(scene, x, y, texture);

        this.correcta = correcta;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
        this.setScale(1.3);
    }

}

export default Key;
