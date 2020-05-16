'use strict';

const pixi = require('pixi.js');

const Block = require('./Block');
const Keyboard = require('./Keyboard');
const KeyCodes = Keyboard.KeyCodes;
const Loader = require('./Loader');
const Screens = require('./Screens');
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
    this.timeOver = 800;
    this.minGroupLengthGoal = 3;
    this.speed = 6;
    this.blockWidth = 48;
    this.groundLevel = this.h - this.blockWidth;
    this.blockFactory = [];
    this.staticBlocks = [];
    this.dyingBlocks = [];
    this.movingBlock;
    this.prevPosition = new Vector();
    this.rows;
    this.gpsByRow = [];

    this.makeLayers();
    this.init();
    this.DEBUG = true;
  }

  checkLines() {
    this.resetRows();
    // Place block.value in a 2D array represneting the tetris grid
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
    // deleteing blocks from dyingBlocks
    for (const block of this.dyingBlocks) {
      block.kill();
      this.staticBlocks.splice(this.staticBlocks.indexOf(block), 1);
    }
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

  init() {
    this.app.ticker.add((dt) => {
      this.loop(dt);
    });

    this.makeKeyboard();

    new Loader(this.urls, this.dispatchSprites.bind(this));
    document.body.appendChild(this.app.view);

    this.state = this.welcome;
  }

  loop(dt) {
    if (this.timeOver < 0) {
      this.state = this.gameover;
    }
    this.state(dt);
    this.timeOver -= 1;
  }

  makeKeyboard() {
    this.keyboard = new Keyboard({
      space: KeyCodes.SPACE,
      left: KeyCodes.LEFT,
      right: KeyCodes.RIGHT,
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
    this.screen.calculateBounds();
    this.app.stage.addChild(this.screen);

    this.hui = new pixi.Container();
    this.screen.name = 'hui';
    this.app.stage.addChild(this.hui);
  }

  moveLines(dt) {
    let nStopped = 0;

    this.staticBlocks.sort(function (a, b) {
      return b.sprite.y - a.sprite.y;
    });

    for (const block of this.staticBlocks) {
      block.isStopped = false;
    }

    for (let n = 0; n < this.staticBlocks.length; n++) {
      const block = this.staticBlocks[n];
      if (!block.isStopped) {
        block.moveY(2 * this.speed * dt);
        block.checkGround();
        for (const b of this.staticBlocks) {
          block.checkCollisions(b);
        }
        if (block.isStopped) {
          nStopped += 1;
        }
      }
    }

    if (nStopped === this.staticBlocks.length) {
      this.newMovingBlock();
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

  // STATES
  gameover(dt) {
    console.info('GAME OVER');
    this.app.ticker.stop();
  }

  play(dt) {
    if (this.movingBlock !== undefined) {
      this.movingBlock.moveY(this.speed * dt);

      for (const block of this.staticBlocks) {
        this.movingBlock.checkCollisions(block);
      }
      this.movingBlock.checkGround();

      // Block stopped by hitting the bottom edge or the top of another bloc
      if (this.movingBlock._isStopped) {
        this.staticBlocks.push(this.movingBlock);
        this.movingBlock = undefined;
        this.checkLines();
      }
    } else {
      this.moveLines(dt);
    }
  }

  preparePlay(dt) {
    this.keyboard.left.press = () => {
      this.movingBlock.moveX(-this.blockWidth);
      this.movingBlock.checkEdges();
    };

    this.keyboard.right.press = () => {
      this.movingBlock.moveX(this.blockWidth);
      this.movingBlock.checkEdges();
    };
    this.keyboard.space.press = () => {};
    this.rows = [];

    this.resetRows();

    this.newMovingBlock();
    this.state = this.play;
    console.info('GAME ON...');
  }

  welcome(dt) {
    console.info('LOADING GAME...');
    this.keyboard.space.press = () => {
      this.state = this.preparePlay;
      this.screen.removeChildren();
      this.background.filters = [];
    };
    if (this.screen.children.length == 0) {
      Screens.welcome(this.screen);
    }
    if (this.background.children.length > 0) {
      this.background.filters = [new pixi.filters.BlurFilter(2, 4)];
    }
  }
}

module.exports = Game;
