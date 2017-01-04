const Howler = require('howler'); // eslint-disable-line no-unused-vars
const ClientEngine = require('incheon').ClientEngine;
const SpaaaceRenderer = require('../client/SpaaaceRenderer');
const Ship = require('../common/Ship');

class SpaaaceClientEngine extends ClientEngine {
    constructor(gameEngine, options) {
        super(gameEngine, options);

        // initialize renderer
        this.renderer = new SpaaaceRenderer(gameEngine);

        this.serializer.registerClass(require('../common/Ship'));
        this.serializer.registerClass(require('../common/Missile'));

        this.gameEngine.on('client__preStep', this.preStep.bind(this));
    }

    start() {

        super.start();

        //  Game input
        // keep a reference for key press state
        this.pressedKeys = {};

        // add special handler for space key
        document.addEventListener('keydown', (e) => {
            if (e.keyCode=='32' && !this.pressedKeys['space']) {
                this.sendInput('space');
            }
        });

        document.addEventListener('keydown', (e) => { onKeyChange.call(this, e, true);});
        document.addEventListener('keyup', (e) => { onKeyChange.call(this, e, false);});


        // handle gui for game condition
        this.gameEngine.on('objectDestroyed',(obj)=>{
            if (obj.class == Ship && obj.isPlayerControlled){
                document.body.classList.add('lostGame');
                document.querySelector('#tryAgain').disabled = false;
            }
        });

        this.gameEngine.once('renderer.ready', ()=>{
            // click event for "try again" button
            document.querySelector('#tryAgain').addEventListener('click', ()=>{
                document.querySelector('#tryAgain').disabled = true;
                this.socket.emit('requestRestart');
            });
        });

        // allow a custom path for sounds
        let assetPathPrefix = this.options.assetPathPrefix?this.options.assetPathPrefix:'';

        // handle sounds
        this.sounds = {
            missileHit: new Howl({ src: [assetPathPrefix + 'assets/audio/193429__unfa__projectile-hit.mp3'] }),
            fireMissile: new Howl({ src: [assetPathPrefix +'assets/audio/248293__chocobaggy__weird-laser-gun.mp3'] })
        };

        this.gameEngine.on('fireMissile', () => { this.sounds.fireMissile.play(); });
        this.gameEngine.on('missileHit', () => { this.sounds.missileHit.play(); });

        this.networkMonitor.on('RTTUpdate',(e) => {
            this.renderer.updateHUD(e);
        });
    }

    // extend ClientEngine connect to add own events
    connect(){
        return super.connect().then( () =>{
            this.socket.on('scoreUpdate', (e) =>{
                console.log(e);
            })
        })
    }

    // our pre-step is to process inputs that are "currently pressed" during the game step
    preStep() {
        if (this.pressedKeys.up) {
            this.sendInput('up', { movement: true } );
        }

        if (this.pressedKeys.left) {
            this.sendInput('left', { movement: true });
        }

        if (this.pressedKeys.right) {
            this.sendInput('right', { movement: true });
        }
    }

}

// private functions


// keyboard handling
const keyCodeTable = {
    '32': 'space',
    '37': 'left',
    '38': 'up',
    '39': 'right'
};

function onKeyChange(e, isDown) {
    e = e || window.event;

    let keyName = keyCodeTable[e.keyCode];
    if (keyName) {
        this.pressedKeys[keyName] = isDown;
        // keep reference to the last key pressed to avoid duplicates
        this.lastKeyPressed = isDown?e.keyCode:null;
        this.gameEngine.emit('client.keyChange',{ keyName, isDown });
        e.preventDefault();
    }
}


module.exports = SpaaaceClientEngine;
