const ClientEngine = require('incheon').ClientEngine;


class SpaaaceClientEngine extends ClientEngine{
    constructor(gameEngine){
        super(gameEngine);

        this.serializer.registerClass(require('../common/Ship'));
        this.serializer.registerClass(require('../common/Missile'));

        this.gameEngine.on('client.preStep', this.preStep.bind(this));
    }

    start(){
        var that = this;

        super.start();

        //  Game input
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.sounds = {
            fireMissile: game.add.audio('fireMissile'),
            missileHit: game.add.audio('missileHit')
        };

        this.gameEngine.on("fireMissile",function(){
            that.sounds.fireMissile.play();
        })

        this.gameEngine.on("missileHit",function(){
            that.sounds.missileHit.play();
        })
    }

    // our pre-step is to process all inputs
    preStep(){
        //continuous press
        if (this.cursors.up.isDown) {
            this.sendInput('up');
        }

        if (this.cursors.left.isDown) {
            this.sendInput('left');
        }

        if (this.cursors.right.isDown) {
            this.sendInput('right');
        }

        //single press
        if (this.spaceKey.isDown && this.spaceKey.repeats == 0){
            this.sendInput('space');
        }
    }

}


module.exports = SpaaaceClientEngine;
