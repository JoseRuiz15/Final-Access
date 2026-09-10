import IController from "../interfaces/IController.js";

/**
 * Controlador del jugador.
 * Principio SRP: unica responsabilidad es manejar la entrada del jugador.
 * Principio DIP: depende de InputService (abstraccion), no de Phaser teclas directo.
 */
export default class PlayerController extends IController {

    constructor(player, inputService) {
        super();
        this.player = player;
        this.inputService = inputService;
    }

    /**
     * Procesa la entrada y la aplica al jugador.
     * @param {number} _delta
     */
    handleInput(_delta) {
        if (!this.player.isAlive()) return;
        if (this.player.recibiendoDaño) return;
        if (this.player.ataque) return;

        if (this.inputService.isAttacking()) {
            this.player.atacar();
            return;
        }

        if (this.inputService.isMovingLeft()) {
            this.player.setVelocityX(-this.player.velocidad);
            this.player.setFlipX(true);
            if (this.player.body.blocked.down) {
                this.player.play("caminar", true);
            }
        } else if (this.inputService.isMovingRight()) {
            this.player.setVelocityX(this.player.velocidad);
            this.player.setFlipX(false);
            if (this.player.body.blocked.down) {
                this.player.play("caminar", true);
            }
        } else {
            this.player.setVelocityX(0);
            if (this.player.body.blocked.down && !this.player.ataque && !this.player.muerto) {
                this.player.setTexture("player");
            }
        }

        if (this.inputService.isJumping() && this.player.body.blocked.down) {
            this.player.setVelocityY(-500);
            this.player.play("saltar", true);
        }

        if (!this.player.body.blocked.down && !this.player.ataque) {
            this.player.play("saltar", true);
        }
    }

    reset() {
        this.player.respawn();
    }
}
