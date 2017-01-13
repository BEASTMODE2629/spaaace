const EventEmitter = require('eventemitter3');
const Utils = require('../common/Utils');

/**
 * This class handles touch device controls
 */
class MobileControls{

    constructor(renderer){
        Object.assign(this, EventEmitter.prototype);
        this.renderer = renderer;

        this.touchContainer = document.querySelector(".pixiContainer");
        this.setupListeners();

        this.activeInput = {
            up: false,
            left: false,
            right: false
        };

        let onRequestAnimationFrame = () => {
            this.handleMovementInput();
            window.requestAnimationFrame(onRequestAnimationFrame);
        };

        onRequestAnimationFrame();

    }

    setupListeners(){
        let touchHandler = (e) => {
            // If there's exactly one finger inside this element
            let touch = e.targetTouches[0];
            this.currentTouch = {
                x: touch.pageX,
                y: touch.pageY
            };

            if (e.type === 'touchstart' && e.targetTouches[1]){
                this.emit('fire');
            }
        };

        this.touchContainer.addEventListener('touchstart', touchHandler, false);
        this.touchContainer.addEventListener('touchmove', (e) =>{
            touchHandler(e);
            // prevent scrolling
            e.preventDefault();
        }, false);

        this.touchContainer.addEventListener('touchend', (e) => {
            this.currentTouch = false;
            this.activeInput.up = false;
            this.activeInput.left = false;
            this.activeInput.right = false;
            this.renderer.onKeyChange({ keyName: 'up', isDown: false });
        }, false);

        document.querySelector('.fireButton').addEventListener('click', () => {
            this.emit('fire');
        });
    }

    handleMovementInput(){
        // no touch, no movement
        if (!this.currentTouch) return;

        let playerShip = this.renderer.playerShip;
        // no player ship, no movement
        if (!playerShip) return;

        let playerShipScreenCoords = this.renderer.gameCoordsToScreen(playerShip);

        let shortestArc = Utils.shortestArc(Math.atan2(this.currentTouch.x - playerShipScreenCoords.x, -(this.currentTouch.y - playerShipScreenCoords.y)),
            Math.atan2(Math.sin(playerShip.actor.shipContainerSprite.rotation + Math.PI / 2), Math.cos(playerShip.actor.shipContainerSprite.rotation + Math.PI / 2)));

        let rotateThreshold = 0.05;

        if (shortestArc > rotateThreshold){
            this.activeInput.left = true;
            this.activeInput.right = false;
        } else if (shortestArc < -rotateThreshold) {
            this.activeInput.right = true;
            this.activeInput.left = false;
        }

        this.activeInput.up = true;
        this.renderer.onKeyChange({ keyName: 'up', isDown: true });

    }

}

module.exports = MobileControls;
