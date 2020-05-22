'use strict';

const pixi = require('pixi.js');

const h1 = new pixi.TextStyle();
h1.fontFamily = 'Press Start 2P';
h1.padding = 5;
h1.fontSize = '3em';

const p = new pixi.TextStyle();
p.fontFamily = 'Press Start 2P';
p.fontSize = '1em';

exports.h1 = h1;
exports.p = p;
