/**
 * Contrato para el servicio de fisica.
 * Principio SRP: encapsula toda la logica de colisiones y overlape.
 * Principio DIP: las escenas dependen de esta abstraccion, no de this.physics directo.
 */
export default class IPhysicsService {
    /**
     * Agrega una colision entre dos objetos fisicos.
     * @param {object} object1 - Primer objeto Phaser
     * @param {object} object2 - Segundo objeto Phaser
     * @param {function} callback - Funcion a ejecutar en la colision
     */
    addCollider(_object1, _object2, _callback) {
        throw new Error("Method 'addCollider()' must be implemented.");
    }

    /**
     * Agrega un overlap entre dos objetos fisicos.
     * @param {object} object1 - Primer objeto Phaser
     * @param {object} object2 - Segundo objeto Phaser
     * @param {function} callback - Funcion a ejecutar en el overlap
     */
    addOverlap(_object1, _object2, _callback) {
        throw new Error("Method 'addOverlap()' must be implemented.");
    }

    /**
     * Configura los limites del mundo fisico.
     * @param {number} width - Ancho del mundo
     * @param {number} height - Alto del mundo
     */
    setBounds(_width, _height) {
        throw new Error("Method 'setBounds()' must be implemented.");
    }

    /**
     * Crea un grupo fisico vacio.
     * @returns {object} - Grupo de Phaser
     */
    createGroup() {
        throw new Error("Method 'createGroup()' must be implemented.");
    }
}
