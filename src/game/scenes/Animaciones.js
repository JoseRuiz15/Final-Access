/**
 * Clase utilitaria para animaciones compartidas entre niveles.
 * Define frameRate y repeat que se usarán en todos los niveles.
 * Cada nivel seguirá usando this.anims.create() con sus propios frames,
 * pero usando la configuración centralizada de frameRate y repeat.
 */
export default class Animaciones {
  /**
   * Definiciones de animación para el jugador.
   * @returns {object} - frameRate y repeat centralizados
   */
  static getJugador() {
    return {
      caminar: { frameRate: 10, repeat: -1 },
      saltar: { frameRate: 3, repeat: 0 },
      atacar: { frameRate: 18, repeat: 0 },
      playerDie: { frameRate: 12, repeat: 0 },
      playerDamage: { frameRate: 12, repeat: 0 },
    }
  }

  /**
   * Definiciones de animación para el enemigo.
   * @returns {object} - frameRate y repeat centralizados
   */
  static getEnemigo() {
    return {
      enemyWalk: { frameRate: 10, repeat: -1 },
      enemyAttack: { frameRate: 10, repeat: -1 },
      enemyDamage: { frameRate: 12, repeat: 0 },
    }
  }
}
