import Phaser from "phaser";
import Player from "../objects/player.js";
import Enemy from "../objects/enemy.js";

class Level1Scene extends Phaser.Scene {

    constructor() {
        super("Level1Scene");
    }

    preload() {

        // MAPA

        this.load.tilemapTiledJSON(
            "level1",
            "/maps/Mapa_level_1.json"
        );

        //Fondo parallax
        this.load.image("parallax", "img/parallax_background_layer_1.png");
        this.load.image("parallax2", "img/parallax_background_layer_2.png");
        this.load.image("parallax3", "img/parallax_background_layer_3.png");
        this.load.image("parallax4", "img/parallax_background_layer_4.png");
        this.load.image("parallax5", "img/parallax_background_layer_5.png");

        //Pisos del mapa
        this.load.image("box", "tiles/box.png");
        this.load.image("decorations", "tiles/decorations.png");
        this.load.image("ground", "tiles/ground.png");
        this.load.image("walls", "tiles/walls.png");


        // JUGADOR
        this.load.image(
            "player",
            "/img/defaultCharacter.png"
        );

        this.load.spritesheet(
            "playerWalk",
            "/img/PlayerWalk.png",
            {
                frameWidth: 32,
                frameHeight: 32
            }
        );

        this.load.spritesheet(
            "playerJump",
            "/img/playerJump.png",
            {
                frameWidth: 32,
                frameHeight: 32
            }
        );

        this.load.spritesheet(
            "playerAttack",
            "/img/playerAttack.png",
            {
                frameWidth: 48,
                frameHeight: 32
            }
        );


        // ENEMIGO

        this.load.spritesheet(
            "enemyWalk",
            "/img/enemyWalk.png",
            {
                frameWidth: 48,
                frameHeight: 32
            }
        )

        this.load.spritesheet(
            "enemy2Attack",
            "/img/enemy2attack.png",
            {
                frameWidth: 48,
                frameHeight: 32
            }
        )


        this.load.spritesheet(
            "proyectile",
            "/img/enemy2attackeffect.png",
            {
                frameWidth:48,
                frameHeight: 32
            }
        )

    }

    create() {

        console.log("Nivel 1 iniciado");

        // ==========================
        // FONDO PARALLAX
        // ==========================

        this.bg1 = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "parallax").setOrigin(0);
        this.bg2 = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "parallax2").setOrigin(0);
        this.bg3 = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "parallax3").setOrigin(0);
        this.bg4 = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "parallax4").setOrigin(0);
        this.bg5 = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "parallax5").setOrigin(0);

        // Escala para que ocupen toda la pantalla
        const scale = Math.max(
            this.scale.width / 512,
            this.scale.height / 288
        );

        this.bg1.setScale(scale);
        this.bg2.setScale(scale);
        this.bg3.setScale(scale);
        this.bg4.setScale(scale);
        this.bg5.setScale(scale);

        this.bg5.y = 100;
        this.bg4.y = 90;
        this.bg3.y = 80;
        this.bg2.y = 70;

        // Mantenerlas fijas en la cámara
        this.bg1.setScrollFactor(0);
        this.bg2.setScrollFactor(0);
        this.bg3.setScrollFactor(0);
        this.bg4.setScrollFactor(0);
        this.bg5.setScrollFactor(0);

        // Orden de profundidad
        this.bg1.setDepth(-5);
        this.bg2.setDepth(-4);
        this.bg3.setDepth(-3);
        this.bg4.setDepth(-2);
        this.bg5.setDepth(-1);
        //creacion del mapa

        const map = this.make.tilemap({ key: "level1" });
        const groundTiles = map.addTilesetImage("ground", "ground");
        const decorationTiles = map.addTilesetImage("decorations", "decorations");
        const boxTiles = map.addTilesetImage("box", "box");
        const wallTiles = map.addTilesetImage("walls", "walls");

        //creacion de capas del mapa

         map.createLayer("BackGround",
            [groundTiles, decorationTiles, boxTiles]
        );

        const cratesLayer = map.createLayer(
            "Crates",
            [groundTiles, decorationTiles, boxTiles]
        );
        cratesLayer.setCollisionByExclusion([-1]);

        const wallsLayer = map.createLayer(
            "Walls",
            [groundTiles, decorationTiles, boxTiles, wallTiles]
        );

        wallsLayer.setCollisionByExclusion([-1]);

         map.createLayer(
            "Door",
            [groundTiles, decorationTiles, boxTiles]
        );

        const groundLayer = map.createLayer(
            "Ground",
            [groundTiles, decorationTiles, boxTiles]
        );

        groundLayer.setCollisionByExclusion([-1]);


        // Camara y seguimiento del jugador
        this.cameras.main.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        this.cameras.main.setViewport(
            0,
            0,
            this.scale.width,
            this.scale.height
        );




        this.proyectiles = this.physics.add.group();

        // ANIMACIONES DEL JUGADOR

        this.anims.create({
            key: "caminar",

            frames: this.anims.generateFrameNumbers("playerWalk", {
                start: 0,
                end: 7
            }),

            frameRate: 10,
            repeat: -1
        });

        this.anims.create ({
            key: "saltar",

            frames: this.anims.generateFrameNumbers("playerJump", {

                start: 0,
                end: 6
            }),
            frameRate: 3,
            repeat: 0

        });

        this.anims.create({
            key: "atacar",

            frames: this.anims.generateFrameNumbers("playerAttack", {
                start: 0,
                end: 12
            }),

            frameRate: 12,
            repeat: 0
        });

        this.player = new Player(
            this,
            300,
            300,
            "player"
        );

        this.cameras.main.startFollow(this.player);

        this.player.on ("animationcomplete-atacar",
        () =>{

        this.player.ataque = false;

        this.player.setTexture("player");

        }

    );


        //ANIMACIONES DEL ENEMIGO

        this.anims.create({
            key: "enemyWalk",
            frames: this.anims.generateFrameNumbers("enemyWalk", {
                start: 0,
                end: 4
            }),
            frameRate: 10,
            repeat: -1
        });

        //animacion de ataque

        this.anims.create({
            key: "enemyAttack",
            frames: this.anims.generateFrameNumbers("enemy2Attack", {
                start: 0,
                end: 4
            }),
            frameRate: 10,
            repeat: -1

        });

        // ENEMIGO
        this.enemy = new Enemy(
            this,
            600,
            300,
            "enemyWalk"
        );

        //FISICAS DEL SUELO
       //this.suelo = this.physics.add.staticGroup();

        //this.suelo.create(640, 680, null)
           // .setSize(1280, 80)
            //.setVisible(false);

        this.physics.add.collider(
            this.player,
            groundLayer
        );

        this.physics.add.collider(
            this.enemy,
            groundLayer
        );

        this.physics.add.collider(
            this.player,
            cratesLayer
        );

         //aniamcion del proyectil
         this.anims.create({
            key: "proyectile",
            frames: this.anims.generateFrameNumbers("proyectile",{

                start: 0,
                end: 5
            }),
            frameRate: 10,
            repeat: -1
    });




    this.physics.add.overlap(
        this.player,
        this.proyectiles,

        (player, bala) => {

            player.recibirDaño(20);

            bala.destroy();
        }
    );
    }


    update() {

        this.player.mover();
        this.enemy.mover();

const camX = this.cameras.main.scrollX;

this.bg1.tilePositionX += ((camX * 0.08) - this.bg1.tilePositionX) * 0.08;
this.bg2.tilePositionX += ((camX * 0.15) - this.bg2.tilePositionX) * 0.08;
this.bg3.tilePositionX += ((camX * 0.25) - this.bg3.tilePositionX) * 0.08;
this.bg4.tilePositionX += ((camX * 0.40) - this.bg4.tilePositionX) * 0.08;
this.bg5.tilePositionX += ((camX * 0.60) - this.bg5.tilePositionX) * 0.08;

    }

}

export default Level1Scene;
