import Phaser from '../lib/phaser.js'

import Item from '../game/item.js'

export default class Game extends Phaser.Scene {

    itemsCollected = 0

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

    preload() {
        //load background image
        this.load.image('background', 'assets/bg_layer1.png')

        //load the platform image
        this.load.image('platform', 'assets/ground_grass.png')

        //load the player stand animation
        this.load.image('player-stand', 'assets/bunny1_stand.png')

        //load item image
        this.load.image('item', 'assets/carrot.png')

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
        this.itemsCollectedText = this.add.text(240, 10, 'items: 0', style)
        .setScrollFactor(0)
        .setOrigin(0.5, 0)

    }

    update(t, dt) {

        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child

            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 100)
                platform.body.updateFromGameObject()
                this.addItemAbove(platform)
            }
        })

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

        if (touchingDown) {
            this.player.setVelocityY(-300)
        }

        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        if (this.cursors.left.isDown && !touchingDown) {
            this.player.setVelocityX(-200)
        }
        else if (this.cursors.right.isDown && !touchingDown) {
            this.player.setVelocityX(200)
        }
        else {
            this.player.setVelocityX(0)
        }

        this.horizontalWrap(this.player)

        const bottomPlatform = this.findBottomMostPlatform()
        if (this.player.y > bottomPlatform.y + 200) {
            console.log('game over')
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

        //update itemsCollectedText
        const value = 'items: ' + this.itemsCollected
        this.itemsCollectedText.text = value
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