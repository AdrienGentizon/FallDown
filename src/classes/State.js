'use strict';

const pixi = require('pixi.js');

const FontStyle = require('./FontStyle');

class State {
  constructor(container, game = undefined, info = '') {
    this._container = container;
    this._game = game;
    this._info = info;
    this.init();
  }
  init() {}
  update(dt) {}
  exit() {}
}

class Play extends State {
  constructor(container, game = undefined, info = '') {
    super(container, game, info);
  }

  init() {
    console.info(this._info);

    this._game.keyboard.left.press = () => {
      this._game.movingBlock.moveX(-this._game.blockWidth);
      this._game.movingBlock.checkEdges();
      for (const block of this._game.staticBlocks) {
        this._game.movingBlock.checkCollisionsX(block);
      }
    };

    this._game.keyboard.right.press = () => {
      this._game.movingBlock.moveX(this._game.blockWidth);
      this._game.movingBlock.checkEdges();
      for (const block of this._game.staticBlocks) {
        this._game.movingBlock.checkCollisionsX(block);
      }
    };
    this._game.keyboard.space.press = () => {};

    this._game.keyboard.esc.press = () => {
      this._game.state = new GameOver(this._container, this._game, 'GAME OVER');
    };
    this._game.rows = [];

    this._game.resetRows();

    this._game.newMovingBlock();
  }

  update(dt) {
    if (this._gametimeOver < 0) {
      this.exit();
    }

    if (this._game.movingBlock !== undefined) {
      this._game.movingBlock.moveY(this._game.speed * dt);

      for (const block of this._game.staticBlocks) {
        this._game.movingBlock.checkCollisionsY(block);
      }
      this._game.movingBlock.checkGround();

      // Block stopped by hitting the bottom edge or the top of another bloc
      if (this._game.movingBlock._isStopped) {
        this._game.staticBlocks.push(this._game.movingBlock);
        this._game.movingBlock = undefined;
        this._game.checkLines();
      }
    } else {
      this._game.moveLines(dt);
    }

    this._game.timeOver -= 1;
  }

  exit() {
    this._game.state = new GameOver(this._container, this._game, 'GAME OVER');
  }
}

class GameOver extends State {
  constructor(container, game = undefined, info = '') {
    super(container, game, info);
  }

  init() {
    console.info(this._info);
    let msg = new pixi.Text('GAME OVER', FontStyle.h1);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 - 48);
    this._container.addChild(msg);
  }

  update(dt) {}

  exit() {
    this._game.app.ticker.stop();
  }
}

class Welcome extends State {
  constructor(container, game = undefined, info = '') {
    super(container, game, info);
  }

  init() {
    console.info(this._info);
    for (let n = 0; n < 3; n++) {
      this._game.keyboard.prompt.addInput(0);
      this._game.keyboard.prompt.size += 1;
    }

    this._game.keyboard.up.press = () => {
      this._game.keyboard.prompt.nextChar(1);
    };

    this._game.keyboard.down.press = () => {
      this._game.keyboard.prompt.nextChar(-1);
    };

    this._game.keyboard.left.press = () => {
      this._game.keyboard.prompt.nextLetter(-1);
    };

    this._game.keyboard.right.press = () => {
      this._game.keyboard.prompt.nextLetter(1);
    };

    this._game.keyboard.enter.press = () => {
      if (this._game.storage.checkUserNameFormat(this._game.user.name)) {
        if (this._game.storage.getUser(this._game.user.name) === undefined) {
          this._game.storage.setUser(this._game.user.name, 'name', this._game.user.name);
          this._game.storage.setUser(this._game.user.name, 'score', 0);
        }

        this._game.storage.getUser(this._game.user.name);
        console.debug(`OFF YOU GO ${this._game.user.name}`);
        this._game.screen.removeChildren();
        this._game.background.filters = [];
        this.exit();
      }
    };

    // TEXTS
    let msg = new pixi.Text('FALL_DOWN', FontStyle.h1);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 - 48);
    this._container.addChild(msg);

    let txt = `Use ${String.fromCharCode(8593)} and ${String.fromCharCode(8595)} to scroll into letters.`;
    msg = new pixi.Text(txt, FontStyle.p);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2);
    this._container.addChild(msg);

    txt = `Press Enter to log in.`;
    msg = new pixi.Text(txt, FontStyle.p);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 + 24);
    this._container.addChild(msg);

    this.userName = new pixi.Text(`${this._game.keyboard.prompt}`, FontStyle.h1);
    this.userName.position.set((this._container._width - this.userName.width) / 2, this._container._height / 2 + 64);
    this._container.addChild(this.userName);
  }

  update(dt) {
    this.userName.text = `${this._game.keyboard.prompt}`;
    this._game.user.name = this.userName.text;
  }

  exit() {
    this._game.state = new Play(this._container, this._game, 'PLAYING...');
  }
}

exports.Play = Play;
exports.GameOver = GameOver;
exports.Welcome = Welcome;
