window.addEventListener('load', function () {
    var config = {
        type: Phaser.AUTO,
        width: 900,
        height: 700,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: true
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    var game = new Phaser.Game(config);
}
)