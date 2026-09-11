import Entity from "./Entity.js";
import EntityFactory from "../factories/EntityFactory.js";
/** @implements {IEntity} */

export default class Player extends Entity {

    constructor(scene, x, y, texture, gameRepository) {
        super(scene, x, y, texture);

        this.spawnX = x;
        this.spawnY = y;
        this.gameRepository = gameRepository;
        this._enemies = null;
        this._boxes = null;

        this.setDisplaySize(48, 48);
        this.texture = texture;

        this._vida = 100;
        this._maxVida = 100;
        this._vidas = 5;
        this._velocidad = 160;
        this._dano = 20;
        this._ataque = false;
        this._muerto = false;
        this._recibiendoDano = false;
        this._llaves = [];

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(false);
    }

    get vida() { return this._vida; }
    set vida(v) { this._vida = v; }

    get maxVida() { return this._maxVida; }

    get vidas() { return this._vidas; }
    set vidas(v) { this._vidas = v; }

    get velocidad() { return this._velocidad; }

    get dano() { return this._dano; }

    get ataque() { return this._ataque; }
    set ataque(v) { this._ataque = v; }

    get muerto() { return this._muerto; }
    set muerto(v) { this._muerto = v; }

    get recibiendoDano() { return this._recibiendoDano; }
    set recibiendoDano(v) { this._recibiendoDano = v; }

    get llaves() { return this._llaves; }

    set enemies(e) { this._enemies = e; }
    set boxes(b) { this._boxes = b; }

    /**
     * @param {number} amount
     * @returns {boolean} true si murio
     */
    takeDamage(amount) {
        this._vida -= amount;
        if (this._vida <= 0) this._vida = 0;

        if (this._vida <= 0) {
            this._vida = 0;
            this._muerto = true;
            this.setVelocity(0, 0);
            this.play("playerDie");
            this.scene.onPlayerDeath?.();
            return true;
        }
        return false;
    }

    update(_delta) {}

    atacar() {
        if (this._ataque || this._recibiendoDano || this._muerto) return;

        this.setVelocityX(0);
        this._ataque = true;
        this.play("atacar");

        const offsetX = this.flipX ? -30 : 30;
        const hitbox = EntityFactory.createAttackHitbox(
            this.scene, this.x + offsetX, this.y, this._dano, this
        );

        this.scene.physics.add.overlap(
            hitbox, this._enemies,
            (hitbox, enemigo) => {
                const muerto = enemigo.takeDamage(hitbox.damage);
                if (muerto) { this.scene.onEnemyDied?.(); }
                hitbox.destroy();
            }
        );

        this.scene.physics.add.overlap(
            hitbox, this._boxes,
            (hitbox, caja) => { caja.romper(); }
        );
    }

    recogerLlave(llave) {
        this._llaves.push({
            texture: llave.texture.key,
            grupo: llave.grupo,
            color: llave.color,
            efecto: llave.efecto,
            correcta: llave.correcta
        });

        this.gameRepository.llaves = this._llaves.length;
        console.log("Inventario:", this._llaves);
        llave.destroy();
    }

    recibirDano(dano) {
        if (this._muerto || this._recibiendoDano) return;
        this._ataque = false;
        this._vida -= dano;

        if (this._vida <= 0) {
            this._vida = 0;
            this._vidas--;
            this.gameRepository.vidas = this._vidas;
            this._muerto = true;
            this.setVelocity(0, 0);
            this.play("playerDie");
        } else {
            this._recibiendoDano = true;
            this.setVelocity(0, 0);
            this.play("playerDamage");
        }
    }

    respawn() {
        this._vida = 100;
        this.setPosition(this.spawnX, this.spawnY);
        this.setVelocity(0, 0);
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.setTexture("player");
        this._muerto = false;
        this._recibiendoDano = false;
        this._ataque = false;
    }

    getType() { return "player"; }

    moverIzquierda() {
        this.setVelocityX(-this._velocidad);
        this.setFlipX(true);
        if (this.body.blocked.down) { this.play("caminar", true); }
    }

    moverDerecha() {
        this.setVelocityX(this._velocidad);
        this.setFlipX(false);
        if (this.body.blocked.down) { this.play("caminar", true); }
    }

    detenerMovimiento() {
        this.setVelocityX(0);
        if (this.body.blocked.down && !this._ataque && !this._muerto) {
            this.setTexture("player");
        }
    }

    saltar() {
        if (this.body.blocked.down) {
            this.setVelocityY(-500);
            this.play("saltar", true);
        }
    }
}
