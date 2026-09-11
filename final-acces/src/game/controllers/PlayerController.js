import IController from "../interfaces/IController.js";

/**
 * Controlador del jugador.
 * SRP: unica responsabilidad es manejar la entrada del jugador.
 * DIP: depende de InputService (abstraccion), no de Phaser teclas directo.
 */
export default class PlayerController extends IController {

    constructor(player, inputService) {
        super();
        this.player = player;
        this.inputService = inputService;
    }

    /**
     * Lee input via InputService y ejecuta acciones en Player.
     * @param {number} _delta
     */
    handleInput(_delta) {
        if (!this.player.isAlive()) return;
        if (this.player.recibiendoDano) return;
        if (this.player.ataque) return;

        if (this.inputService.isAttacking()) {
            this.player.atacar();
            return;
        }

        if (this.inputService.isMovingLeft()) {
            this.player.moverIzquierda();
        } else if (this.inputService.isMovingRight()) {
            this.player.moverDerecha();
        } else {
            this.player.detenerMovimiento();
        }

        if (this.inputService.isJumping()) {
            this.player.saltar();
        }

        if (!this.player.body.blocked.down && !this.player.ataque) {
            this.player.play("saltar", true);
        }
    }

    reset() {
        this.player.respawn();
    }
}
