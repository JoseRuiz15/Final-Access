import Phaser from "phaser";

class AttackHitbox extends Phaser.GameObjects.Zone {

    constructor(scene, x, y, width, height, damage, owner) {

        super(scene, x, y, width, height);

        this.damage = damage;
        this.owner = owner;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        scene.time.delayedCall(150, () => {

            if (this.active) {
                this.destroy();
            }

        });

    }

}

export default AttackHitbox;
