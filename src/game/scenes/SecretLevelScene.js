import Phaser from 'phaser'

const SCENE_KEY = 'SecretLevelScene'

export default class SecretLevelScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY })
  }

  create(data = {}) {
    const { width, height } = this.scale
    this.returnScene = data.returnScene

    this.cameras.main.setBackgroundColor('#080d1c')
    this.add.rectangle(width / 2, height / 2, width, height, 0x080d1c)
    this.add.text(width / 2, 90, 'ZONA SECRETA', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#00e5ff',
      stroke: '#03121c',
      strokeThickness: 6,
    }).setOrigin(0.5)
    this.add.text(width / 2, 132, 'Has encontrado el acceso oculto', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#d9faff',
    }).setOrigin(0.5)

    const platforms = this.physics.add.staticGroup()
    const floor = platforms.create(width / 2, height - 35, 'ground')
    floor.setVisible(false)
    floor.body.setSize(width, 70).setOffset(0, 0).updateFromGameObject()

    for (const [x, y, platformWidth] of [
      [width * 0.24, height * 0.69, 180],
      [width * 0.52, height * 0.55, 220],
      [width * 0.78, height * 0.69, 180],
    ]) {
      const platform = this.add.rectangle(x, y, platformWidth, 18, 0x153b59)
      this.physics.add.existing(platform, true)
      platforms.add(platform)
      this.add.rectangle(x, y - 9, platformWidth, 3, 0x00e5ff)
    }

    const texture = 'secret-character'
    if (!this.textures.exists(texture)) {
      const fallback = this.make.graphics({ x: 0, y: 0, add: false })
      fallback.fillStyle(0xf1b84b)
      fallback.fillRoundedRect(5, 13, 18, 27, 5)
      fallback.fillStyle(0x07101f)
      fallback.fillRoundedRect(2, 3, 24, 18, 7)
      fallback.fillStyle(0x00e5ff)
      fallback.fillRect(6, 10, 16, 3)
      fallback.fillStyle(0xf7f2dc)
      fallback.fillRect(8, 31, 4, 10)
      fallback.fillRect(17, 31, 4, 10)
      fallback.generateTexture(texture, 28, 42)
      fallback.destroy()
    }
    this.player = this.physics.add.sprite(width * 0.15, height - 110, texture)
    this.player.setCollideWorldBounds(true)
    this.player.setBounce(0)
    this.physics.add.collider(this.player, platforms)

    const enemy = this.add.rectangle(width * 0.72, height - 92, 42, 48, 0xff3f65)
    this.physics.add.existing(enemy)
    enemy.body.setAllowGravity(false)
    enemy.body.setVelocityX(-90)
    enemy.patrolBounds = [width * 0.58, width * 0.86]
    this.enemy = enemy
    this.physics.add.collider(enemy, platforms)

    this.add.text(width / 2, height - 94, 'B: VOLVER AL NIVEL', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.keys = this.input.keyboard.addKeys('A,D,LEFT,RIGHT,SPACE,UP,B')
    this.physics.add.overlap(this.player, enemy, () => {
      // El primer prototipo reinicia al jugador al tocar al enemigo.
      this.player.setPosition(width * 0.15, height - 110)
      this.player.setVelocity(0, 0)
    })
  }

  update() {
    const body = this.player.body
    const left = this.keys.A.isDown || this.keys.LEFT.isDown
    const right = this.keys.D.isDown || this.keys.RIGHT.isDown
    body.setVelocityX(left ? -220 : right ? 220 : 0)

    if (
      (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
        Phaser.Input.Keyboard.JustDown(this.keys.UP)) &&
      body.blocked.down
    ) {
      body.setVelocityY(-470)
    }

    if (this.enemy.x < this.enemy.patrolBounds[0]) this.enemy.body.setVelocityX(90)
    if (this.enemy.x > this.enemy.patrolBounds[1]) this.enemy.body.setVelocityX(-90)

    if (Phaser.Input.Keyboard.JustDown(this.keys.B)) this.returnToLevel()
  }

  returnToLevel() {
    if (!this.returnScene) return
    const returnScene = this.returnScene
    this.scene.stop()
    this.scene.resume(returnScene)
  }
}
