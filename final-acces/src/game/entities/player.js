import Phaser from "phaser";
import AttackHitbox from "./attackHitbox.js";
import { useGameStore } from "@/stores/game.js";
/** @implements {IEntity} */

export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture);

        this.spawnX = x;
        this.spawnY = y;

        this.setDisplaySize(48, 48);
        this.texture = texture;

        //Atributos del jugador
        this.vida = 100;
        this.maxVida = 100;
        this.vidas = 5;
        this.velocidad = 160;
        this.daño = 20;
        this.gameStore = useGameStore();

        this.ataque = false;
        this.muerto = false;
        this.recibiendoDaño = false;
        this.llaves = [];

        //Teclas de control
        this.teclas = {
          izquierda: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          derecha: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
          saltar: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
          atacar: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
          interactuar: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G)
        }

        //Agregar a Pasher y habilitar física
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(false);
    }
    /**
     * @returns {{x: number, y: number}} @implements IEntity:getPosition()
     */

    getPosition(){
        return {x:this.x, y:this.y};
    }
    /**
     * @returns {number} @implements IEntity:getHealth()
     */
    getHealth(){
        return this.vida;
    }
    /**
     * @returns {boolean} @implements IEntity:isAlive()
     */
    isAlive(){
        return this.vida > 0;
    }
    /**
     * @param {number} amount @implements IEntity:takeDamage()
     * @returns {boolean} true si murió
     */
    takeDamage(amount){
      this.vida -= amount;
      if (this.vida <= 0) this.vida = 0;

      if (this.vida <=0){
        this.vida = 0;
        this.muerto = true;
        this.setVelocity(0,0);
        this.play("playerDie");
        this.scene.onPlayerDeath?.();
        return true;
      }
      return false;
    }
    /**
     * @param {number} _delta @implements IEntity:update()
     */
    update(_delta) {
      if (this.recibiendoDaño){
        return;
      }
      if (this.muerto){
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(this.teclas.atacar)){
        this.atacar();
      }
      if(this.ataque){
        return;
      }
      if (this.teclas.izquierda.isDown) {
          this.setVelocityX(-this.velocidad);
          this.setFlipX(true);
          if (this.body.blocked.down) {
              this.play("caminar", true);
          }
        } else if (this.teclas.derecha.isDown) {
          this.setVelocityX(this.velocidad);
          this.setFlipX(false);
          if (this.body.blocked.down) {
              const anim = this.scene.anims.get("caminar");
              if (!anim) {
                  console.error("No existe la animación caminar");
              } else {
                  this.play("caminar", true);
              }
          }
      } else {
          this.setVelocityX(0);
          if (this.body.blocked.down && !this.ataque && !this.muerto) {
              this.setTexture("player");
          }
        }
        if (this.teclas.saltar.isDown && this.body.blocked.down) {
            this.setVelocityY(-500);
            this.play("saltar", true);
        }
        if (!this.body.blocked.down && !this.ataque) {
            this.play("saltar", true);
        }
    }
/**
 * @returns {Phaser.Textures.Texture} @implements IEntity:getTexture()
 */
getTexture() {
    return this.texture;
}

atacar() {

    if (this.ataque || this.recibiendoDaño || this.muerto) {
        return;
    }

    this.setVelocityX(0);
    this.ataque = true;
    this.play("atacar");

    const offsetX = this.flipX ? -30 : 30;

    const hitbox = new AttackHitbox(
        this.scene,
        this.x + offsetX,
        this.y,
        40,
        30,
        this.daño,
        this
    );

    this.scene.physics.add.overlap(
        hitbox,
        this.scene.enemies,
        (hitbox, enemigo) => {

          const muerto = enemigo.takeDamage(hitbox.damage);

          if (muerto) {
              this.scene.onEnemyDied?.();
          }
            hitbox.destroy();
        }

    );

      this.scene.physics.add.overlap(
      hitbox,
      this.scene.boxes,
      (hitbox, caja) => {
          caja.romper();
      }

  );
}

recogerLlave(llave) {

    this.llaves.push({
        texture:llave.texture.key,
        grupo: llave.grupo,
        color: llave.color,
        efecto: llave.efecto,
        correcta: llave.correcta
    });

    this.gameStore.llaves = this.llaves.length;
    console.log("Inventario:", this.llaves);
    llave.destroy();
}

recibirDaño(daño) {

    if (this.muerto || this.recibiendoDaño) return;
    this.ataque = false;
    this.vida -= daño;

    if (this.vida <= 0) {
        this.vida = 0;
        this.vidas--;
        this.gameStore.vidas = this.vidas;
        this.muerto = true;
        this.setVelocity(0,0);
        this.play("playerDie");
    } else {
        this.recibiendoDaño = true;
        this.setVelocity(0,0);
        this.play("playerDamage");
    }
}

  respawn() {
    this.vida = 100;
    this.setPosition(this.spawnX, this.spawnY);
    this.setVelocity(0, 0);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.setTexture("player");
    this.muerto = false;
    this.recibiendoDaño = false;
    this.ataque = false;
    }
    /**
     * @returns {string} @implements IEntity:getType()
     */
    getType(){
        return "player";
    }

    /**
     * Metodo de movimiento principal. Lo llama Level1Scene en su update().
     * Contiene la logica de entrada, animaciones y fisica del jugador.
     */
    mover() {
        if (this.recibiendoDaño) return;
        if (this.muerto) return;

        if (Phaser.Input.Keyboard.JustDown(this.teclas.atacar)) {
            this.atacar();
        }

        if (this.ataque) return;

        if (this.teclas.izquierda.isDown) {
            this.setVelocityX(-this.velocidad);
            this.setFlipX(true);
            if (this.body.blocked.down) {
                this.play("caminar", true);
            }
        } else if (this.teclas.derecha.isDown) {
            this.setVelocityX(this.velocidad);
            this.setFlipX(false);
            if (this.body.blocked.down) {
                const anim = this.scene.anims.get("caminar");
                if (!anim) {
                    console.error("No existe la animación caminar");
                } else {
                    this.play("caminar", true);
                }
            }
        } else {
            this.setVelocityX(0);
            if (this.body.blocked.down && !this.ataque && !this.muerto) {
                this.setTexture("player");
            }
        }

        if (this.teclas.saltar.isDown && this.body.blocked.down) {
            this.setVelocityY(-500);
            this.play("saltar", true);
        }

        if (!this.body.blocked.down && !this.ataque) {
            this.play("saltar", true);
        }
    }
}
