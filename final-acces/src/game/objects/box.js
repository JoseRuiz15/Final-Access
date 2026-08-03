import Phaser from "phaser";

class Box extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {

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

          this.destroy();

      });



        this.setImmovable(true);
        this.body.setAllowGravity(false);

        // Mostrar la caja intacta
        this.setFrame(0);

    }


    romper(){

      if (!this.active) return;

      this.body.enable = false;

      this.play("boxBreak");

    }

}

export default Box;
