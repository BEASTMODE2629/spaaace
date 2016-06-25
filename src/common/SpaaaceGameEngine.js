"use strict";

const GameEngine = require('Incheon').GameEngine;
const Ship = require('./Ship');
const Missile= require('./Missile');
const BruteForce = require('./collisionDetection/BruteForce');

class SpaaaceGameEngine extends GameEngine {
    constructor(){
        super();

        this.registerClass(Ship);
        this.registerClass(Missile);

        this.bruteForce = new BruteForce(this);
    }
    
    start(){
        super.start();

        this.worldSettings = {
            width: 800,
            height: 600
        };
    };

    processInput(inputData, playerId){
        //get the player ship tied to the player socket
        var playerShip = this.world.objects[playerId];

        if (playerShip) {
            if (inputData.input == "up") {
                playerShip.isAccelerating = true;
            }
            else if (inputData.input == "right") {
                playerShip.isRotatingRight = true;
            }
            else if (inputData.input == "left") {
                playerShip.isRotatingLeft = true;
            }
            else if (inputData.input == "space") {
                this.makeMissile(playerShip);
            }
        }
    };

    makeShip(playerId) {
        if (playerId in this.world.objects){
            console.log("warning, object with id ", playerId, " alraedy exists");
            return null;
        }

        var newShipX = Math.floor(Math.random()*(this.worldSettings.width-200)) + 200;
        var newShipY = Math.floor(Math.random()*(this.worldSettings.height-200)) + 200;

        var ship = new Ship(++this.world.idCount, newShipX, newShipY);
        ship.playerId = playerId;
        this.addObjectToWorld(ship);

        return ship;
    };

    makeMissile(playerShip){
        var missile = new Missile(++this.world.idCount);
        missile.x = playerShip.x;
        missile.y = playerShip.y;
        missile.angle = playerShip.angle;
        missile.playerId = playerShip.playerId;

        this.addObjectToWorld(missile);
        // missile.step(this.worldSettings); //hack to step the missile velocity\
        this.timer.add(40, this.destroyMissile, this, [missile.id]);

        return missile;
    }

    destroyMissile(missileId){
        delete this.world.objects[missileId];
    }
}

module.exports = SpaaaceGameEngine;