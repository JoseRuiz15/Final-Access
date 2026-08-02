import Phaser from "phaser";

class Attack {

    constructor(scene, x, y, width, height) {

        this.scene = scene;

        this.hitbox = scene.add.rectangle(
            x,
            y,
            width,
            height,
            0xff0000,
            0.4 // invisible
        );

        scene.physics.add.existing(this.hitbox);

        this.hitbox.body.allowGravity = false;

        scene.time.delayedCall(200, () => {

        this.hitbox.destroy();

    });
    }

}

export default Attack;