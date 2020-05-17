const pixi = require('pixi.js');
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
      this._game.movingBlock.moveX(-this.blockWidth);
      this._game.movingBlock.checkEdges();
      for (const block of this.staticBlocks) {
        this._game.movingBlock.checkCollisionsX(block);
      }
    };

    this._game.keyboard.right.press = () => {
      this._game.movingBlock.moveX(this.blockWidth);
      this._game.movingBlock.checkEdges();
      for (const block of this.staticBlocks) {
        this._game.movingBlock.checkCollisionsX(block);
      }
    };
    this._game.keyboard.space.press = () => {};
    this._game.rows = [];

    this._game.resetRows();

    this._game.newMovingBlock();
  }

  update(dt) {
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
  }

  exit() {
    this._game.state = new State.GameOver();
  }
}

class GameOver extends Screen {
  constructor(container, game = undefined, info = '') {
    super(container, game, info);
  }

  init() {
    console.info(this._info);
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
    this._game.keyboard.space.press = () => {
      this._game.screen.removeChildren();
      this._game.background.filters = [];
      this.exit();
    };
    const msg = new pixi.Text('FALL_DOWN', { fontFamily: 'Press Start 2P' });
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2);
    this._container.addChild(msg);
  }

  update(dt) {}

  exit() {
    this._game.state = new Play(this._container, this._game, 'PLAYING...');
  }
}

exports.Play = Play;
exports.GameOver = GameOver;
exports.Welcome = Welcome;
