import Phaser from "phaser";
import Player from "../objects/player.js";
import Enemy from "../objects/enemy.js";

class Level1Scene extends Phaser.Scene {

    constructor() {
        super("Level1Scene");
    }

    preload() {

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

        this.load.spritesheet(
            "playerDamage",
            "/img/playerDamage.png",
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
         this.anims.create({
        key: "playerDie",
        frames: this.anims.generateFrameNumbers("playerDamage", {
            start: 0,
            end: 5
        }),
        frameRate: 8,
        repeat: 0
    });


        this.player = new Player(
            this,
            300,
            300,
            "player"
        );

        this.player.on("animationcomplete-playerDie", () => {

            this.player.body.enable = false;

            this.time.delayedCall(1000, () => {

                this.player.respawn();
            });



        });

        
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
       this.suelo = this.physics.add.staticGroup();

        this.suelo.create(640, 680, null)
            .setSize(1280, 80)
            .setVisible(false);
        
        this.physics.add.collider(
            this.player,
            this.suelo

        );

        this.physics.add.collider(
            this.enemy,
            this.suelo
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
    (player, proyectil) => {

        player.recibirDaño(20);
        proyectil.destroy();

    }
);

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

    }

    

}

export default Level1Scene;