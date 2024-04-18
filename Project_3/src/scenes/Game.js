import Phaser from '../lib/phaser.js'

import Item from '../game/Item.js'

export default class Game extends Phaser.Scene {

    itemsCollected = 0

    currentScore = 0

    doubleJump = 2

    /** @type  {Phaser.GameObjects.Text} */
    doubleJumpText

    /** @type {Phaser.GameObjects.Text} */
    itemsCollectedText

    /**@type {Phaser.Physics.Arcade.StaticGroup} */
    platforms

    /** @type {Phaser.Physics.Arcade.Spite} */
    player

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors

    /** @type {Phaser.Physics.Arcade.Group} */
    items

    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */

    addItemAbove(sprite) {
        const y = sprite.y - sprite.displayHeight

        /** @type {Phaser.Physics.Arcade.Sprite} */
        const item = this.items.get(sprite.x, y, 'item')

        item.setActive(true)
        item.setVisible(true)

        this.add.existing(item)

        //update physics body size
        item.body.setSize(item.width, item.height)

        this.physics.world.enable(item)

        return item
    }

    constructor() {
        super('game')
    }

    init() {
        this.itemsCollected = 0
        this.doubleJump = 2
    }

    preload() {

        //load the platform image
        this.load.image('platform', 'assets/ground_grass.png')

        //load the player stand image
        this.load.image('player-stand', 'assets/bunny1_stand.png')

        //load item image
        this.load.image('item', 'assets/carrot.png')

        //load placer jump image
        this.load.image('player-jump', 'assets/bunny1_jump.png')

        //load jump audio
        this.load.audio('jump', 'assets/sfx/phaseJump1.ogg')

        //load the input-cursor
        this.cursors = this.input.keyboard.createCursorKeys()
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

        //camera horizontal deadzone
        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        //create item
        this.items = this.physics.add.group({
            classType: Item
        })

        //add collision to item
        this.physics.add.collider(this.platforms, this.items)

        this.physics.add.overlap(
            this.player,
            this.items,
            this.handleCollectItem,
            undefined,
            this
        )

        const style = { color: '#000', fontSize: 24 }
        this.itemsCollectedText = this.add.text(400, 10, 'items: 0', style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0)

        this.doubleJumpText = this.add.text(600, 600, 'double-jumps: 2', style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0)

    }

    update() {

        //this.platforms.children.iterate(child => {
        //    /** @type {Phaser.Physics.Arcade.Sprite} */
        //    const platform = child

        //    const scrollY = this.cameras.main.scrollY
        //    if (platform.y >= scrollY + 700) {
        //        platform.y = scrollY - Phaser.Math.Between(50, 100)
        //        platform.x = Phaser.Math.Between(80, 400)
        //        platform.body.updateFromGameObject()
        //        this.addItemAbove(platform)
        //    }
        //})

        const lowerFifth = this.cameras.main.height * 0.8; // Lower fifth of the screen

        this.platforms.children.iterate((platform) => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platformY = platform.y - this.cameras.main.scrollY;

            if (platformY >= lowerFifth) {
                // Relocate the platform above the screen
                platform.y = this.cameras.main.scrollY - Phaser.Math.Between(50, 100);
                platform.x = Phaser.Math.Between(80, 400);
                platform.body.updateFromGameObject();
                this.addItemAbove(platform)
            }
        });

        this.items.children.iterate(child => {
            /**  @type {Phaser.Physics.Arcade.Sprite} */
            const item = child

            const scrollY = this.cameras.main.scrollY
            if (item.y >= scrollY + 700) {
                item.y = scrollY - Phaser.Math.Between(50, 100)
                item.body.updateFromGameObject()
                this.items.killAndHide(item)
                this.physics.world.disableBody(item.body)
            }
        })

        //check player bottom collision
        const touchingDown = this.player.body.touching.down

        //player jump while on platform
        if (touchingDown && this.cursors.space.isDown) {
            this.player.setVelocityY(-400)

            this.player.setTexture('player-jump')

            this.sound.play('jump')
        }

        //Double-jump
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.doubleJump > 0) {
            if (!touchingDown) {
                this.player.setVelocityY(-400);
                this.doubleJump--;
                this.doubleJumpText.setText('double-jump: ' + this.doubleJump)
                this.player.setTexture('player-jump')
                this.sound.play('jump')
            } else {
                this.player.setVelocityY(-400);
            }
        }

        //switch texture of player once they start falling down
        const vy = this.player.body.velocity.y
        if (vy > 0 && this.player.texture.key !== 'player-stand') {
            this.player.setTexture('player-stand')
        }

        //diable up-/left-/right- collision for player
        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        //move left
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200)
        }
        //move right
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200)
        }
        //stop moving horizontally
        else {
            this.player.setVelocityX(0)
        }

        //allows player to loop around the screen
        this.horizontalWrap(this.player)

        //start game-over scene once player falls beyond last platform
        const bottomPlatform = this.findBottomMostPlatform()
        if (this.player.y > bottomPlatform.y + 200) {
            this.scene.start('game-over', { score: this.currentScore })
        }


    }

    /**
    * @param {Phaser.GameObjects.Sprite} sprite
    */
    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if (sprite.x < -halfWidth) {
            sprite.x = gameWidth + halfWidth
        }
        else if (sprite.x > gameWidth + halfWidth) {
            sprite.x = -halfWidth
        }
    }

    /**
     * @param {Phaser.Physics.Arcade.Srite} player
     * @param {Item} item
     */
    handleCollectItem(player, item) {
        //hide from display
        this.items.killAndHide(item)

        //disable from physics world
        this.physics.world.disableBody(item.body)

        //increment itemsCollected by 1
        this.itemsCollected++

        this.currentScore = this.itemsCollected

        //update itemsCollectedText
        this.itemsCollectedText.setText('items: ' + this.itemsCollected)

        //increase double-jump counter if itemsCollected >= 5
        if (this.itemsCollected % 5 == 0) {
            this.doubleJump++
            this.doubleJumpText.setText('double-jump: ' + this.doubleJump)
        }
    }

    findBottomMostPlatform() {
        const platforms = this.platforms.getChildren()
        let bottomPlatform = platforms[0]

        for (let i = 1; i < platforms.length; i++) {
            const platform = platforms[i]

            if (platform.y < bottomPlatform.y) {
                continue
            }

            bottomPlatform = platform
        }
        return bottomPlatform
    }
}