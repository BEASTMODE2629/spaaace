"use strict";

const GameEngine = require('incheon').GameEngine;
const Ship = require('./Ship');
const Missile= require('./Missile');
const BruteForce = require('./collisionDetection/BruteForce');

class SpaaaceGameEngine extends GameEngine {
    constructor(options){
        super(options);

        this.registerClass(Ship);
        this.registerClass(Missile);

        this.bruteForce = new BruteForce(this);
    }

    start(){
        var that = this;
        super.start();

        this.worldSettings = {
            width: 800,
            height: 600
        };

        this.on("collisionStart",function(objects){
            let ship, missile;

            if (objects.a.class == Ship && objects.b.class == Missile){
                ship = objects.a;
                missile = objects.b;
            }
            else if (objects.b.class == Ship && objects.a.class == Missile){
                ship = objects.b;
                missile = objects.a;
            }


            if (ship && missile) {
                if (missile.playerId != ship.playerId) {
                    that.destroyMissile(missile.id);
                    that.emit("missileHit",{
                        missile: missile,
                        ship: ship
                    })
                }
            }

        })
    };

    processInput(inputData, playerId){
        //get the player ship tied to the player socket
        var playerShip;

        for (let objId in this.world.objects) {
            if (this.world.objects[objId].playerId == playerId){
                playerShip = this.world.objects[objId];
                break;
            }
        }

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
                this.emit("fireMissile");
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
