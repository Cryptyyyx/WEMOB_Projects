import Phaser from '../lib/phaser.js'

export default class GameStart extends Phaser.Scene {
    constructor() {
        super('game-start')
    }

    preload() {
        //load background image
        this.load.image('background', 'assets/bg_layer1.png')
    }

    create() {

        //create background image
        this.add.image(240, 320, 'background')
        .setScrollFactor(1, 0)

        const width = this.scale.width
        const height = this.scale.height
        this.add.text(width * 0.5, height * 0.5, 'Tap SPACE to start!', {
            fontSize: 32,
            color: '#000000'
        })
        .setOrigin(0.5)

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('game')
        })
    }
}