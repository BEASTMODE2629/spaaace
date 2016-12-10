const qsOptions = require('query-string').parse(location.search);
const SpaaaceClientEngine = require('../client/SpaaaceClientEngine');
const SpaaaceGameEngine = require('../common/SpaaaceGameEngine');
const SimplePhysicsEngine = require('incheon').physics.SimplePhysicsEngine;

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: 1,
    delayInputCount: 3,
    clientIDSpace: 1000000,
    syncOptions: {
        sync: qsOptions.sync || 'extrapolate',
        localObjBending: 0.0,
        remoteObjBending: 0.6
    }
};
let options = Object.assign(defaults, qsOptions);

// create a client engine and a game engine
const physicsEngine = new SimplePhysicsEngine();
const gameOptions = Object.assign({ physicsEngine }, options);
const gameEngine = new SpaaaceGameEngine(gameOptions);
const clientEngine = new SpaaaceClientEngine(gameEngine, options);

clientEngine.start();


