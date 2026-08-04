import Phaser from "phaser";
import Key from "../objects/key.js";

class Box extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, keyData = null ) {


        super(scene, x, y, "crateBreak");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        if (!scene.anims.exists("boxBreak")) {

          scene.anims.create({

              key: "boxBreak",

              frames: scene.anims.generateFrameNumbers("crateBreak", {
                  start: 0,
                  end: 4
              }),

              frameRate: 12,
              repeat: 0

          });

        }


        this.on("animationcomplete-boxBreak", () => {

            if (this.keyData) {

                const llave = new Key(
                    this.scene,
                    this.x,
                    this.y,
                    this.keyData.texture,
                    this.keyData
                );
                llave.setVelocityY(-220);
                llave.setVelocityX(
                    Phaser.Math.Between(-40, 40)
                );

                this.scene.keys.add(llave);

            }

            this.destroy();

        });



        this.setImmovable(true);
        this.body.setAllowGravity(false);

        // Mostrar la caja intacta
        this.setFrame(0);

        this.keyData = keyData;

console.log(
    "Gravity:", this.body.allowGravity,
    "Immovable:", this.body.immovable
);

    }


    romper(){

      if (!this.active) return;

      this.body.enable = false;

      this.play("boxBreak");

    }

}

export default Box;
