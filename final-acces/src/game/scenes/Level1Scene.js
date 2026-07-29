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

    }

    create() {

        console.log("Nivel 1 iniciado");

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