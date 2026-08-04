import Phaser from "phaser";

class Key extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, datos) {

        super(scene, x, y, texture);

        this.grupo = datos.grupo;
        this.color = datos.color;
        this.efecto = datos.efecto;
        this.correcta = datos.correcta;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
        this.setScale(1.3);

        if (texture === "key2") {
            this.play("key2Spin");
        }
    }

}

export default Key;
