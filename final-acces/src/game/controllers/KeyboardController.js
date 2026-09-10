import Phaser from 'phaser';

export default class KeyboardController {
  constructor(scene, player) {

    this.scene = scene;
    this.player = player;

  //Teclas para controlar el movimiento del jugador
    this.keys =scene.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    //Tecla para recoger llaves
    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);

    //Tecla para atacar
    this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

  }

    update(){
      this.keyboardMovement();
      this.handleInteraction();
      this.handleAttack();
    }

    keyboardMovement(){
      let directionX = 0;
      let directionY = 0;

      //Movimiento horizontal
      if (this.keys.A.isDown) {
        directionX = -1;
      } else if (this.keys.D.isDown) {
        directionX = 1;
      }

      //Movimiento vertical
      if (this.keys.W.isDown) {
        directionY = -1;
      } else if (this.keys.S.isDown) {
        directionY = 1;
      }

      this.player.move(directionX, directionY);
    }

    handleInteraction() {
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.player.interact();
      }
    }

    handleAttack() {
      if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
        this.player.attack();
      }
    }
}
