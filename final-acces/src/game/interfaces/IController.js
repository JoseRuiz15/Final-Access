/**
 * Contrato para controladores de entrada.
 * Principio ISP: interfaz pequena y especifica para cada tipo de controlador.
 * Principio DIP: las escenas dependen de esta abstraccion, no de implementaciones concretas.
 */
export default class IController {
    /**
     * Procesa la entrada del usuario y la aplica a la entidad controlada.
     * @param {number} delta - Tiempo transcurrido en ms desde el ultimo frame
     */
    handleInput(_delta) {
        throw new Error("Method 'handleInput(delta)' must be implemented.");
    }

    /**
     * Reinicia el estado del controlador.
     */
    reset() {
        throw new Error("Method 'reset()' must be implemented.");
    }
}
