import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene {

    /**@type {Phaser.Physics.Arcade.StaticGroup} */
    platforms

    /** @type {Phaser.Physics.Arcade.Spite} */
    player

    constructor() {
        super('game')
    }

    preload() {
        //load background image
        this.load.image('background', 'assets/bg_layer1.png')

        //load the platform image
        this.load.image('platform', 'assets/ground_grass.png')

        //load the player stand animation
        this.load.image('player-stand', 'assets/bunny1_stand.png')
    }

    create() {
        //add background image
        this.add.image(240, 320, 'background')
        .setScrollFactor(1, 0)

        //create group
        this.platforms = this.physics.add.staticGroup()
        
        //5 instances of that group
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(80, 400)
            const y = 150 * i

            /** @type {Phaser.Physics.Arcade.Sprites} */
            const platform = this.platforms.create(x, y, 'platform')
            platform.scale = 0.5

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body
            body.updateFromGameObject()
        }
        //create player character
        this.player = this.physics.add.sprite(240, 320, 'player-stand')
        .setScale(0.5)
        
        //add collision to player
        this.physics.add.collider(this.platforms, this.player)
        
        //camera following player
        this.cameras.main.startFollow(this.player)
    }

    update() {

        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child

            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 100)
                platform.body.updateFromGameObject()
            }
        })

        //check player bottom collision
        const touchingDown = this.player.body.touching.down

        if (touchingDown) {
            this.player.setVelocityY(-300)
        }

        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false
    }

}