import Phaser from "phaser";
import Projectile from "../factories/projectile.js";
import { useGameStore } from "@/stores/game.js";

/**
 * @implements {IEntity}
 * Enemy entity - patrulla, persigue y ataca al jugador
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {

        super(scene, x, y, texture);

        this.scene = scene;
        this.setScale(1.5);

        this.vida = 40;
        this.velocidad = 50;
        this.daño = 20;

        this.direccion = 1;
        this.atacando = false;
        this.puedeDisparar = true;
        this.recibiendoDaño = false;
        this.muerto = false;
        this.gameStore = useGameStore();
        this.texture = texture;

        this.limiteIzquierdo = 670;
        this.limiteDerecho = 1100;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
    }

    // === IMPLEMENTACION IENTITY ===

    /**
     * @returns {{x: number, y: number}}
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * @returns {number}
     */
    getHealth() {
        return this.vida;
    }

    /**
     * @returns {boolean}
     */
    isAlive() {
        return this.vida > 0;
    }

    /**
     * @param {number} amount
     * @returns {boolean} true si el enemigo murio
     */
    takeDamage(amount) {
        if (this.muerto || this.recibiendoDaño) return false;

        this.vida -= amount;

        if (this.vida <= 0) {
            this.vida = 0;
            this.muerto = true;
            this.setVelocity(0);
            this.body.enable = false;
            this.scene.mostrarExplosion(this.x, this.y);
            this.gameStore.enemigos++;
            this.destroy();
            return true;
        }

        this.recibiendoDaño = true;
        this.setVelocity(0);
        this.play("enemyDamage");
        return false;
    }

    /**
     * @param {number} _delta
     */
    update(_delta) {
        this.mover();
    }

    /**
     * @returns {string}
     */
    getType() {
        return "enemy";
    }

    // === LOGICA DE MOVIMIENTO ===

    mover() {
        if (this.muerto) {
            this.setVelocity(0);
            return;
        }

        if (this.recibiendoDaño) {
            this.setVelocity(0);
            return;
        }

        if (this.atacando) {
            this.setVelocity(0);
            return;
        }

        if (!this.scene.player || !this.scene.player.active) {
            this.setVelocityX(this.velocidad * this.direccion);
            this.setFlipX(this.direccion === 1);
            if (this.body.blocked.right) this.direccion = -1;
            if (this.body.blocked.left) this.direccion = 1;
            return;
        }

        const distancia = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.scene.player.x, this.scene.player.y
        );

        if (!this.anims.isPlaying) {
            this.play("enemyWalk", true);
        }

        if (distancia < 100) {
            this.setVelocityX(0);
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== "enemyAttack") {
                this.play("enemyAttack", true);
            }
            this.atacar();
            return;
        }

        this.setVelocityX(this.velocidad * this.direccion);
        this.setFlipX(this.direccion === 1);
        if (this.x <= this.limiteIzquierdo) this.direccion = 1;
        if (this.x >= this.limiteDerecho) this.direccion = -1;
        if (this.body.blocked.right) this.direccion = -1;
        if (this.body.blocked.left) this.direccion = 1;
    }

    // === ATAQUE CON PROYECTILES ===

    atacar() {
        if (this.atacando || this.muerto || this.recibiendoDaño) return;
        if (!this.puedeDisparar) return;

        this.atacando = true;
        this.puedeDisparar = false;

        this.play("enemyAttack");

        const direccionAtaque = this.scene.player.x < this.x ? -1 : 1;

        this.direccion = direccionAtaque;
        this.setFlipX(this.direccion === 1);

        const distanciaX = 18;
        const alturaY = 3;

        const origenX = this.x + (distanciaX * direccionAtaque);
        const origenY = this.y + alturaY;

        const bala = new Projectile(this.scene, origenX, origenY, "proyectile");
        bala.disparar(direccionAtaque);

        this.scene.physics.add.overlap(bala, this.scene.player, (bala, player) => {
            player.recibirDaño(this.daño);
            bala.destroy();
        });

        this.scene.time.delayedCall(800, () => {
            this.atacando = false;
        });

        this.scene.time.delayedCall(1500, () => {
            this.puedeDisparar = true;
        });
    }
}
