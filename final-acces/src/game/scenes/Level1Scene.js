import Phaser from "phaser";
import Player from "../objects/player.js";

class Level1Scene extends Phaser.Scene {

    constructor() {
        super("Level1Scene");
    }

    preload() {

        this.load.image(
            "player",
            "/img/defaultCharacter.png"
        );

        this.load.spritesheet(
            "playerWalk",
            "/img/PlayerWalk.png",
            {
                frameWidth: 32,
                frameHeight: 32
            }
        );

        this.load.spritesheet(
            "playerJump",
            "/img/playerJump.png",
            {
                frameWidth: 32,
                frameHeight: 32
            }
        );

    }

    create() {

        console.log("Nivel 1 iniciado");

        this.anims.create({
            key: "caminar",

            frames: this.anims.generateFrameNumbers("playerWalk", {
                start: 0,
                end: 7
            }),

            frameRate: 10,
            repeat: -1
        });

        this.anims.create ({
            key: "saltar",

            frames: this.anims.generateFrameNumbers("playerJump", {

                start: 0,
                end: 6
            }),
            frameRate: 3,
            repeat: 0

        });

        this.player = new Player(
            this,
            300,
            300,
            "player"
        );


    
       this.suelo = this.physics.add.staticGroup();

        this.suelo.create(640, 680, null)
            .setSize(1280, 80)
            .setVisible(false);
        
        this.physics.add.collider(
            this.player,
            this.suelo

        );
    }

    update() {

        this.player.mover();

    }

}

export default Level1Scene;