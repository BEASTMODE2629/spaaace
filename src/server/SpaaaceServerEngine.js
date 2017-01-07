'use strict';

const ServerEngine = require('incheon').ServerEngine;
const NameGenerator = require('./NameGenerator');

class SpaaaceServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);

        this.serializer.registerClass(require('../common/Missile'));
        this.serializer.registerClass(require('../common/Ship'));

        this.scoreData = {};
    };

    start() {
        super.start();
        for(let x=0; x<3; x++) this.makeBot();

        this.gameEngine.on('missileHit', (e)=>{
            if (this.scoreData[e.missile.shipOwnerId]) {
                // add kills
                this.scoreData[e.missile.shipOwnerId].kills++;
                // remove score data for killed ship
                delete this.scoreData[e.ship.id];
            }
            this.updateScore();

            this.gameEngine.removeObjectFromWorld(e.ship.id);
            if(e.ship.isBot) {
                this.makeBot();
            }
        });
    };

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);

        let makePlayerShip = ()=>{
            let ship = this.gameEngine.makeShip();
            ship.playerId = socket.playerId;

            this.scoreData[ship.id] = {
                kills: 0,
                name: NameGenerator('general')
            };
            this.updateScore();
        };

        // handle client restart requests
        socket.on('requestRestart', makePlayerShip);
    };

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);

        // iterate through all objects, delete those that are associated with the player
        for (let objId of Object.keys(this.gameEngine.world.objects)) {
            let obj = this.gameEngine.world.objects[objId];
            if (obj.playerId == playerId) {
                // remove score data
                if (this.scoreData[objId]) {
                    delete this.scoreData[objId];
                }
                delete this.gameEngine.world.objects[objId];
            }
        }

        this.updateScore();
    };

    makeBot() {
        let bot = this.gameEngine.makeShip();
        bot.attachAI();

        this.scoreData[bot.id] = {
            kills: 0,
            name: NameGenerator('general') + 'Bot'
        };

        this.updateScore();
    }

    updateScore() {
        // delay so player socket can catch up
        setTimeout(() => {
            this.io.sockets.emit('scoreUpdate', this.scoreData);
        }, 1000);

    }
}

module.exports = SpaaaceServerEngine;
