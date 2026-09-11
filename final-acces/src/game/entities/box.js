import Phaser from "phaser";
import EntityFactory from "../factories/EntityFactory.js";

class Box extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, keyData = null) {
        super(scene, x, y, "crateBreak");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        if (!scene.anims.exists("boxBreak")) {
            scene.anims.create({
                key: "boxBreak",
                frames: scene.anims.generateFrameNumbers("crateBreak", { start: 0, end: 4 }),
                frameRate: 12,
                repeat: 0
            });
        }

        this.on("animationcomplete-boxBreak", () => {
            if (this.keyData) {
                const llave = EntityFactory.createKey(
                    this.scene, this.x, this.y - 100, this.keyData.texture, this.keyData
                );
                this.scene.time.delayedCall(0, () => {
                    llave.setVelocityY(-150);
                    llave.setVelocityX(0);
                });
                this.scene.keys.add(llave);
            }
            this.destroy();
        });

        this.setImmovable(true);
        this.body.setAllowGravity(false);
        this.setFrame(0);
        this.keyData = keyData;
    }

    romper() {
        if (!this.active) return;
        this.body.enable = false;
        this.play("boxBreak");
    }
}

export default Box;
