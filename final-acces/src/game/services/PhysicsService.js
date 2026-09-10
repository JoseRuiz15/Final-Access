import IPhysicsService from "../interfaces/IPhysicsService.js";

/**
 * Implementa IPhysicsService.
 * Principio SRP: unica responsabilidad es gestionar fisica.
 * Principio DIP: las escenas usan esta abstraccion en lugar de this.physics directo.
 */
export default class PhysicsService extends IPhysicsService {

    constructor(scene) {
        super();
        this.scene = scene;
    }

    /**
     * @param {object} object1
     * @param {object} object2
     * @param {function} callback
     */
    addCollider(object1, object2, callback) {
        return this.scene.physics.add.collider(object1, object2, callback);
    }

    /**
     * @param {object} object1
     * @param {object} object2
     * @param {function} callback
     */
    addOverlap(object1, object2, callback) {
        return this.scene.physics.add.overlap(object1, object2, callback);
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    setBounds(width, height) {
        this.scene.physics.world.setBounds(0, 0, width, height);
    }

    /**
     * @returns {object}
     */
    createGroup() {
        return this.scene.physics.add.group();
    }
}
