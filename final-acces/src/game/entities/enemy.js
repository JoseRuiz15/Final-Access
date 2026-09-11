import Phaser from "phaser";
import Entity from "./Entity.js";
import EntityFactory from "../factories/EntityFactory.js";
/** @implements {IEntity} */
export default class Enemy extends Entity {

    constructor(scene, x, y, texture, gameRepository) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.gameRepository = gameRepository;
        this._target = null;
        this.setScale(1.5);

        this._vida = 40;
        this._velocidad = 50;
        this._dano = 20;
        this._direccion = 1;
        this._atacando = false;
        this._puedeDisparar = true;
        this._recibiendoDano = false;
        this._muerto = false;
        this._limiteIzquierdo = 670;
        this._limiteDerecho = 1100;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
    }

    get vida() { return this._vida; }
    set vida(v) { this._vida = v; }

    get velocidad() { return this._velocidad; }
    set velocidad(v) { this._velocidad = v; }

    get dano() { return this._dano; }

    get direccion() { return this._direccion; }
    set direccion(v) { this._direccion = v; }

    get atacando() { return this._atacando; }
    set atacando(v) { this._atacando = v; }

    get puedeDisparar() { return this._puedeDisparar; }
    set puedeDisparar(v) { this._puedeDisparar = v; }

    get recibiendoDano() { return this._recibiendoDano; }
    set recibiendoDano(v) { this._recibiendoDano = v; }

    get muerto() { return this._muerto; }
    set muerto(v) { this._muerto = v; }

    get limiteIzquierdo() { return this._limiteIzquierdo; }
    set limiteIzquierdo(v) { this._limiteIzquierdo = v; }

    get limiteDerecho() { return this._limiteDerecho; }
    set limiteDerecho(v) { this._limiteDerecho = v; }

    set target(t) { this._target = t; }

    takeDamage(amount) {
        if (this._muerto || this._recibiendoDano) return false;
        this._vida -= amount;
        if (this._vida <= 0) {
            this._vida = 0;
            this._muerto = true;
            this.setVelocity(0);
            this.body.enable = false;
            this.scene.mostrarExplosion(this.x, this.y);
            this.gameRepository.incrementarEnemigos();
            this.destroy();
            return true;
        }
        this._recibiendoDano = true;
        this.setVelocity(0);
        this.play("enemyDamage");
        return false;
    }

    update(_delta) { this.mover(); }

    getType() { return "enemy"; }

    mover() {
        if (this._muerto) { this.setVelocity(0); return; }
        if (this._recibiendoDano) { this.setVelocity(0); return; }
        if (this._atacando) { this.setVelocity(0); return; }

        if (!this._target || !this._target.active) {
            this.setVelocityX(this._velocidad * this._direccion);
            this.setFlipX(this._direccion === 1);
            if (this.body.blocked.right) this._direccion = -1;
            if (this.body.blocked.left) this._direccion = 1;
            return;
        }

        const distancia = Phaser.Math.Distance.Between(
            this.x, this.y, this._target.x, this._target.y
        );

        if (!this.anims.isPlaying) { this.play("enemyWalk", true); }

        if (distancia < 100) {
            this.setVelocityX(0);
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== "enemyAttack") {
                this.play("enemyAttack", true);
            }
            this.atacar();
            return;
        }

        this.setVelocityX(this._velocidad * this._direccion);
        this.setFlipX(this._direccion === 1);
        if (this.x <= this._limiteIzquierdo) this._direccion = 1;
        if (this.x >= this._limiteDerecho) this._direccion = -1;
        if (this.body.blocked.right) this._direccion = -1;
        if (this.body.blocked.left) this._direccion = 1;
    }

    atacar() {
        if (this._atacando || this._muerto || this._recibiendoDano) return;
        if (!this._puedeDisparar) return;

        this._atacando = true;
        this._puedeDisparar = false;
        this.play("enemyAttack");

        const dir = this._target.x < this.x ? -1 : 1;
        this._direccion = dir;
        this.setFlipX(dir === 1);

        const origenX = this.x + (18 * dir);
        const origenY = this.y + 3;

        const bala = EntityFactory.createProjectile(this.scene, origenX, origenY, "proyectile");
        bala.disparar(dir);

        this.scene.physics.add.overlap(bala, this._target, (bala, player) => {
            player.recibirDano(this._dano);
            bala.destroy();
        });

        this.scene.time.delayedCall(800, () => { this._atacando = false; });
        this.scene.time.delayedCall(1500, () => { this._puedeDisparar = true; });
    }
}
