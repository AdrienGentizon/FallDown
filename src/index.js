'use strict';
const css = require('./styles/style.scss');
const Game = require('./classes/Game');

const options = {
  width: 480, // default: 800
  height: 720, // default: 600
  antialias: true, // default: false
  transparent: false, // default: false
  resolution: 1, // default: 1
  assets: [
    '../assets/background-kitchen.png',
    '../assets/block-eggplant.png',
    '../assets/block-cherry.png',
    '../assets/block-strawberry.png',
    '../assets/block-watermelon.png',
    '../assets/block-avocado.png',
    '../assets/block-dragonfruit.png',
  ],
};

new Game(options);
