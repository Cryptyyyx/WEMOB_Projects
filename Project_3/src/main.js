import Phaser from './lib/phaser.js'

import Game from './scenes/Game.js'

import GameOver from './scenes/GameOver.js'

import GameStart from './scenes/GameStart.js'

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    scene: [GameStart, Game, GameOver],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 400
            },
            debug: true
        }
    }
})

