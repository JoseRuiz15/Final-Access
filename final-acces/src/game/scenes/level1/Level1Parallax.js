/**
 * Clase encargada de crear y actualizar el fondo parallax del Level 1.
 * Separa la lógica de parallax de la escena principal.
 */
export default class Level1Parallax {

  constructor() {
    this.bgElements = [];
  }

  create(scene, scale = 0.8) {
    this.bgElements = [];

    const fondoAncho = scene.scale.width / scale;
    const fondoAlto = scene.scale.height / scale;
    const fondoX = (scene.scale.width - fondoAncho) / 2;
    const fondoY = (scene.scale.height - fondoAlto) / 2;

    this.bg1 = scene.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax').setOrigin(0);
    this.bg2 = scene.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax2').setOrigin(0);
    this.bg3 = scene.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax3').setOrigin(0);
    this.bg4 = scene.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax4').setOrigin(0);
    this.bg5 = scene.add.tileSprite(fondoX, fondoY, fondoAncho, fondoAlto, 'parallax5').setOrigin(0);

    this.bg5.y = fondoY + 100;
    this.bg4.y = fondoY + 110;

    this.bg1.setScrollFactor(0);
    this.bg2.setScrollFactor(0);
    this.bg3.setScrollFactor(0);
    this.bg4.setScrollFactor(0);
    this.bg5.setScrollFactor(0);

    this.bg1.setDepth(-5);
    this.bg2.setDepth(-4);
    this.bg3.setDepth(-3);
    this.bg4.setDepth(-2);
    this.bg5.setDepth(-1);
  }

  update(scene, camX) {
    if (!this.bg1) return;

    this.bg1.tilePositionX += (camX * 0.08 - this.bg1.tilePositionX) * 0.08;
    this.bg2.tilePositionX += (camX * 0.15 - this.bg2.tilePositionX) * 0.08;
    this.bg3.tilePositionX += (camX * 0.25 - this.bg3.tilePositionX) * 0.08;
    this.bg4.tilePositionX += (camX * 0.4 - this.bg4.tilePositionX) * 0.08;
    this.bg5.tilePositionX += (camX * 0.6 - this.bg5.tilePositionX) * 0.08;
  }
}