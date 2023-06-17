import Phaser from '../lib/phaser.js'

export default class GameOver extends Phaser.Scene {
    constructor() {
        super('game-over')
    }

    create(data) {

        //create background image
        this.add.image(240, 320, 'background')
        .setScrollFactor(1, 0)

        const { score } = data

        //Game Over message
        const width = this.scale.width
        const height = this.scale.height
        this.add.text(width * 0.5, height * 0.5, 'Game Over', {
            fontSize: 48,
            color: '#000000'
        })
        .setOrigin(0.5)

        //High-score message
        this.add.text(width * 0.5, height - 500, 'your score: ' + score, {
            fontSize: 25,
            color: '#000000'
        })
        .setOrigin(0.5)

        //Restart game message
        this.add.text(width * 0.5, height -150 , 'press SPACE to restart', {
            fontSize: 25,
            color: '#000000'
        })
        .setOrigin(0.5)

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('game')
        })
    }
}