'use strict';

const pixi = require('pixi.js');

const Block = require('./Block');
const Keyboard = require('./Keyboard');
const KeyCodes = Keyboard.KeyCodes;
const Loader = require('./Loader');
const Screens = require('./Screens');
const Storage = require('./Storage');
const State = require('./State');
const Vector = require('./Vector');

class Game {
  constructor(options) {
    this.options = options;
    this.urls = this.options.assets;
    this.w = this.options.width;
    this.h = this.options.height;

    this.app = new pixi.Application(this.options);
    this.app.renderer.backgroundColor = 0xeeeeee;
    this.app.renderer.autoResize = true;

    this.keyboard;
    this.timeOver = 2000;
    this.minGroupLengthGoal = 3;
    this.speed = 6;
    this.blockWidth = 48;
    this.groundLevel = this.h - this.blockWidth;
    this.blockFactory = [];
    this.staticBlocks = [];
    this.staticBlocksCursor = 0;
    this.dyingBlocks = [];
    this.movingBlock;
    this.prevPosition = new Vector();
    this.rows;
    this.gpsByRow = [];
    this.user = { name: '', score: 0 };
    this.storage = undefined;

    this.makeLayers();
    this.init();
    this.DEBUG = false;
  }

  checkLines() {
    this.resetRows();
    // Place block.value in a 2D array representing the tetris grid
    for (const block of this.staticBlocks) {
      this.rows[Math.floor(block.sprite.y / this.blockWidth)][Math.floor(block.sprite.x / this.blockWidth)] = block;
    }

    // Group similar adjacent block.value by rows
    this.gpsByRow = [];
    for (let k = this.rows.length - 1; k >= 0; k--) {
      let row = this.rows[k];
      let prevBlock = row[0];
      const gps = [];
      gps[0] = [prevBlock];
      for (let n = 1; n < row.length; n++) {
        let block = row[n];
        if (block.value === prevBlock.value) {
          gps[gps.length - 1].push(block);
        } else {
          gps.push([block]);
        }
        prevBlock = block;
      }
      this.gpsByRow.push(gps);
    }

    // moving blocks from groups which length is > _minGroupLengthGoal
    // to _dyingBlocks
    for (const row of this.gpsByRow) {
      for (const group of row) {
        if (group[0].value !== -1) {
          if (group.length >= this.minGroupLengthGoal) {
            for (const block of group) {
              this.dyingBlocks.push(block);
            }
          }
        }
      }
    }
    // upating score
    this.user.score += this.dyingBlocks.length;

    // deleteing blocks from dyingBlocks
    for (const block of this.dyingBlocks) {
      block.kill();
      this.staticBlocks.splice(this.staticBlocks.indexOf(block), 1);
    }
    // sorts static blocks from the lowest altitude to the highest
    this.staticBlocks.sort(function (a, b) {
      return b.sprite.y - a.sprite.y;
    });
  }

  dispatchSprites(sprites) {
    const pattBackground = /^..\/assets\/(background|bg)([a-z-_0-9])*.(png|jpg)$/i;
    const pattBlock = /^..\/assets\/(block)([a-z-_0-9])*.(png|jpg)$/i;
    for (const url in sprites) {
      if (pattBackground.test(url)) {
        this.background.addChild(sprites[url]);
      } else if (pattBlock.test(url)) {
        const block = new Block(sprites[url], this);
        this.blockFactory.push(block);
      }
    }

    console.info('ASSETS LOADED...');
  }

  findValidPosition(position) {
    // return a stepped position by blockWidth

    return new Vector(
      this.blockWidth * Math.floor(position.x / this.blockWidth),
      this.blockWidth * Math.floor(position.y / this.blockWidth)
    );
  }

  init() {
    // WEBSTORAGE
    this.storage = new Storage();
    this.storage.fetchData();

    // FPS
    this.app.ticker.add((dt) => {
      this.loop(dt);
    });

    // KEYBOARD CONTROLS
    this.makeKeyboard();

    new Loader(this.urls, this.dispatchSprites.bind(this));
    // document.body.appendChild(this.app.view);
    document.getElementsByClassName('app-canvas')[0].appendChild(this.app.view);

    this.state = new State.Welcome(this.screen, this, 'FALL_DOWN GAME');
  }

  loop(dt) {
    this.state.update(dt);
  }

  makeKeyboard() {
    this.keyboard = new Keyboard({
      space: KeyCodes.SPACE,
      left: KeyCodes.LEFT,
      right: KeyCodes.RIGHT,
      up: KeyCodes.UP,
      down: KeyCodes.DOWN,
      esc: KeyCodes.ESC,
      enter: KeyCodes.ENTER,
    });
  }

  makeLayers() {
    this.background = new pixi.Container();
    this.background.name = 'background';
    this.app.stage.addChild(this.background);

    this.screen = new pixi.Container();
    this.screen.name = 'screen';
    this.screen.width = this.w;
    this.screen.height = this.h;
    this.app.stage.addChild(this.screen);

    this.hui = new pixi.Container();
    this.screen.name = 'hui';
    this.app.stage.addChild(this.hui);
  }

  moveLines(dt) {
    this.staticBlocks.sort(function (a, b) {
      return b.sprite.y - a.sprite.y;
    });

    this.unlockStaticBlocks();

    for (let n = 0; n < this.staticBlocks.length; n++) {
      const block = this.staticBlocks[n];
      if (!block.isStopped) {
        block.moveY(0.75 * this.speed * dt);
        block.checkGround();
        for (const b of this.staticBlocks) {
          block.checkCollisionsY(b);
        }
      }
    }
  }

  newMovingBlock() {
    const n = Math.floor(this.blockFactory.length * Math.random());
    this.movingBlock = new Block(new pixi.Sprite(this.blockFactory[n].sprite.texture), this, n);
    const u = new Vector((this.w - this.movingBlock._sprite.width) / 2, 0);
    this.movingBlock.addTo(this.screen, u);
  }

  resetRows() {
    this.rows = [];
    for (let n = 0; n < Math.floor(this.h / this.blockWidth); n++) {
      this.rows[n] = [];
      for (let k = 0; k < Math.floor(this.w / this.blockWidth); k++) {
        this.rows[n][k] = { value: -1 };
      }
    }
    this.dyingBlocks = [];
  }

  unlockStaticBlocks() {
    for (const block of this.staticBlocks) {
      block.isStopped = false;
    }
  }
}

module.exports = Game;
