import Phaser from "phaser";
import LoadingScene from "./scenes/LoadingScene.js";

const config = {
    width: 1280,
    height: 720,
    scene: [LoadingScene],
};

const game = new Phaser.Game(config);