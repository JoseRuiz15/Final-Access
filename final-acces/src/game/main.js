import Phaser from "phaser";
import Level1Scene from "./scenes/Level1Scene.js";

const config = {
    type: Phaser.AUTO,

    width: 1280,
    height: 720,

    scene: Level1Scene
};

const game = new Phaser.Game(config);