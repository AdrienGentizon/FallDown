'use strict';

const pixi = require('pixi.js');
const Block = require('./Block');
const Keyboard = require('./Keyboard');
const KeyCodes = Keyboard.KeyCodes;
const Loader = require('./Loader');
const Vector = require('./Vector');

// SCREENS
const Screens = require('./Screens');

class Game {
  constructor(options) {
    this._options = options;
    this._urls = this._options.assets;
    this.w = this._options.width;
    this.h = this._options.height;
    this._keyboard;
    this.app = new pixi.Application(this._options);

    this._timeOver = 4000;
    this._minGroupLengthGoal = 3;
    this.speed = 6;
    this._blockWidth = 48;
    this._blockFactory = [];
    this._staticBlocks = [];
    this._dyingBlocks = [];
    this._movingBlock;
    this._prevPosition = new Vector();
    this._rows;
    this._gpsByRow = [];

    this.app.renderer.backgroundColor = 0xeeeeee;
    this.app.renderer.autoResize = true;
    // LAYERS
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

    this.app.ticker.add((dt) => {
      this.loop(dt);
    });

    this._makeKeyboard();

    this.state = this.welcome;
    new Loader(this._urls, this._dispatchSprites.bind(this));
    document.body.appendChild(this.app.view);
  }

  loop(dt) {
    if (this._timeOver < 0) {
      this.state = this.gameover;
    }
    this.state(dt);
    this._timeOver -= 1;
  }

  // STATES
  welcome(dt) {
    console.info('LOADING GAME...');
    this._keyboard.space.press = () => {
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

  preparePlay(dt) {
    this._keyboard.left.press = () => {
      this._movingBlock.moveX(-this._blockWidth);
    };

    this._keyboard.right.press = () => {
      this._movingBlock.moveX(this._blockWidth);
    };
    this._keyboard.space.press = () => {};
    this._rows = [];

    this._resetRows();

    this._newMovingBlock();
    this.state = this.play;
    console.info('GAME ON...');
  }

  play(dt) {
    if (this._movingBlock !== undefined) {
      this._movingBlock.moveY(this.speed * dt);

      for (const block of this._staticBlocks) {
        this._movingBlock.checkCollisions(block);
      }
      this._movingBlock.checkEdges();
      this._movingBlock.checkBottom();

      // Block stopped by hitting the bottom edge or the top of another bloc
      if (this._movingBlock.isStopped) {
        this._staticBlocks.push(this._movingBlock);
        this._movingBlock = undefined;
        this._checkLines();
      }
    } else {
      this._moveLines(dt);
    }
  }

  gameover(dt) {
    console.info('GAME OVER');
    this.app.ticker.stop();
  }

  _makeKeyboard() {
    this._keyboard = new Keyboard({
      space: KeyCodes.SPACE,
      left: KeyCodes.LEFT,
      right: KeyCodes.RIGHT,
    });
  }

  _dispatchSprites(sprites) {
    const pattBackground = /^..\/assets\/(background|bg)([a-z-_0-9])*.(png|jpg)$/i;
    const pattBlock = /^..\/assets\/(block)([a-z-_0-9])*.(png|jpg)$/i;
    for (const url in sprites) {
      if (pattBackground.test(url)) {
        this.background.addChild(sprites[url]);
      } else if (pattBlock.test(url)) {
        const block = new Block(sprites[url]);
        this._blockFactory.push(block);
      }
    }

    console.info('ASSETS LOADED...');
  }

  _newMovingBlock() {
    const n = Math.floor(this._blockFactory.length * Math.random());
    this._movingBlock = new Block(new pixi.Sprite(this._blockFactory[n].sprite.texture), this, n);
    const u = new Vector((this.w - this._movingBlock.sprite.width) / 2, 0);
    this._movingBlock.addTo(this.screen, u);
  }

  _resetRows() {
    this._rows = [];
    for (let n = 0; n < Math.floor(this.h / this._blockWidth); n++) {
      this._rows[n] = [];
      for (let k = 0; k < Math.floor(this.w / this._blockWidth); k++) {
        this._rows[n][k] = { value: -1 };
      }
    }
    this._dyingBlocks = [];
  }

  _checkLines() {
    this._resetRows();
    // Place block.value in a 2D array represneting the tetris grid
    for (const block of this._staticBlocks) {
      this._rows[Math.floor(block.sprite.y / this._blockWidth)][Math.floor(block.sprite.x / this._blockWidth)] = block;
    }

    // Group similar adjacent block.value by rows
    this._gpsByRow = [];
    for (let k = this._rows.length - 1; k >= 0; k--) {
      let row = this._rows[k];
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
      this._gpsByRow.push(gps);
    }

    // moving blocks from groups which length is > _minGroupLengthGoal
    // to _dyingBlocks
    for (const row of this._gpsByRow) {
      for (const group of row) {
        if (group[0].value !== -1) {
          if (group.length >= this._minGroupLengthGoal) {
            for (const block of group) {
              this._dyingBlocks.push(block);
            }
          }
        }
      }
    }
    // deleteing blocks from dyingBlocks
    for (const block of this._dyingBlocks) {
      block.kill();
      this._staticBlocks.splice(this._staticBlocks.indexOf(block), 1);
    }
  }

  _moveLines(dt) {
    let nStopped = 0;

    this._staticBlocks.sort(function (a, b) {
      return b.sprite.y - a.sprite.y;
    });

    for (const block of this._staticBlocks) {
      block.isStopped = false;
    }

    for (let n = 0; n < this._staticBlocks.length; n++) {
      const block = this._staticBlocks[n];
      if (!block.isStopped) {
        block.moveY(2 * this.speed * dt);
        block.checkBottom();
        for (const b of this._staticBlocks) {
          block.checkCollisions(b);
        }
        if (block.isStopped) {
          nStopped += 1;
        }
      }
    }

    if (nStopped === this._staticBlocks.length) {
      this._newMovingBlock();
    }
  }
}

module.exports = Game;
