'use strict';

const pixi = require('pixi.js');

const h1 = new pixi.TextStyle();
h1.fontFamily = 'Press Start 2P';
h1.padding = 5;
h1.fontSize = '2.5em';

const h2 = new pixi.TextStyle();
h2.fontFamily = 'Press Start 2P';
h2.fontSize = '1.75em';

const p = new pixi.TextStyle();
p.fontFamily = 'Press Start 2P';
p.fontSize = '1em';

exports.h1 = h1;
exports.h2 = h2;
exports.p = p;
