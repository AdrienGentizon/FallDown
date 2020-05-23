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

class GameOver extends State {
  constructor(container, game = undefined, info = '') {
    super(container, game, info);
  }

  init() {
    console.info(this._info);
    let msg = new pixi.Text('__GAME OVER__', FontStyle.h1);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 - 96);
    this._container.addChild(msg);
  }

  update(dt) {}

  exit() {
    this._game.app.ticker.stop();
  }
}

class Instructions extends State {
  constructor(container, game = undefined, info = '') {
    super(container, game, info);
  }

  init() {
    console.info(this._info);

    this._game.keyboard.enter.press = () => {
      const user = this._game.storage.getUser(this._game.user.name);
      console.debug(`OFF YOU GO ${user}`);
      this.exit();
    };

    let msg = new pixi.Text('__INSTRUCTIONS__', FontStyle.h2);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 - 96);
    this._container.addChild(msg);

    msg = new pixi.Text(`Try to make lines of 3 (or more) fruits.`, FontStyle.p);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2);
    this._container.addChild(msg);

    msg = new pixi.Text(
      `Use ${String.fromCharCode(8592)} and ${String.fromCharCode(8594)} to move the falling fruit.`,
      FontStyle.p
    );
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 + 24);
    this._container.addChild(msg);

    msg = new pixi.Text(`Press <Enter> when ready!`, FontStyle.p);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 + 96);
    this._container.addChild(msg);
  }

  update(dt) {}
  exit() {
    this._container.removeChildren();
    this._game.state = new Play(this._game.screen, this._game, 'PLAYING...');
  }
}

class Play extends State {
  constructor(container, game = undefined, info = '') {
    super(container, game, info);
    this.hui = {
      score: (() => {
        const hui = new pixi.Text('', FontStyle.p);
        hui.position.set(this._container._width / 2, 0);
        return hui;
      })(),
      userName: (() => {
        const hui = new pixi.Text(this._game.user.name, FontStyle.p);
        hui.position.set(0, 0);
        return hui;
      })(),
      timeOver: (() => {
        const hui = new pixi.Text(this._game.timeOver, FontStyle.p);
        hui.position.set(this._container._width - hui.width, 0);
        return hui;
      })(),
    };
    this._container.addChild(this.hui.userName);
    this._container.addChild(this.hui.score);
    this._container.addChild(this.hui.timeOver);
  }

  init() {
    console.info(this._info);

    this._game.keyboard.left.press = () => {
      if (this._game.movingBlock !== undefined) {
        this._game.movingBlock.moveX(-this._game.blockWidth);
        this._game.movingBlock.checkEdges();
        for (const block of this._game.staticBlocks) {
          this._game.movingBlock.checkCollisionsX(block);
        }
      }
    };

    this._game.keyboard.right.press = () => {
      if (this._game.movingBlock !== undefined) {
        this._game.movingBlock.moveX(this._game.blockWidth);
        this._game.movingBlock.checkEdges();
        for (const block of this._game.staticBlocks) {
          this._game.movingBlock.checkCollisionsX(block);
        }
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

    // BLOCK IS FALLING
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
      }
    } else {
      // Checks lines of similar blocks
      // deletes them if necessary
      this._game.checkLines();
      // moves blocks
      // check how many are stopped
      let areStopped = 0;
      for (const block of this._game.staticBlocks) {
        block.isStopped = false;
        block.moveY(0.75 * this._game.speed * dt);
        block.checkGround();
        for (const b of this._game.staticBlocks) {
          block.checkCollisionsY(b);
        }
        if (block.isStopped) {
          areStopped += 1;
        }
      }

      // Checks lines of similar blocks
      // deletes them if necessary
      this._game.checkLines();

      // new moving block if necessary
      if (areStopped === this._game.staticBlocks.length) {
        this._game.newMovingBlock();
      } else {
        console.log(`blocks stopped: ${areStopped}/${this._game.staticBlocks.length}`);
      }
    }

    this._game.timeOver -= 1;

    this.hui.score.text = this._game.user.score * 25;
    this.hui.timeOver.text = Math.floor(this._game.timeOver / 10);
  }

  exit() {
    this._game.state = new GameOver(this._container, this._game, 'GAME OVER');
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
    let msg = new pixi.Text('__FALL_DOWN__', FontStyle.h1);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 - 96);
    this._container.addChild(msg);

    let txt = `Use ${String.fromCharCode(8593)} and ${String.fromCharCode(8595)} to scroll into letters.`;
    msg = new pixi.Text(txt, FontStyle.p);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2);
    this._container.addChild(msg);

    this.userName = new pixi.Text(`${this._game.keyboard.prompt}`, FontStyle.h1);
    this.userName.position.set((this._container._width - this.userName.width) / 2, this._container._height / 2 + 24);
    this._container.addChild(this.userName);

    txt = `Press <Enter> when ready!`;
    msg = new pixi.Text(txt, FontStyle.p);
    msg.position.set((this._container._width - msg.width) / 2, this._container._height / 2 + 96);
    this._container.addChild(msg);
  }

  update(dt) {
    this.userName.text = `${this._game.keyboard.prompt}`;
    this._game.user.name = this.userName.text;
  }

  exit() {
    this._game.state = new Instructions(this._container, this._game, 'INSTRUCTIONS...');
  }
}

exports.GameOver = GameOver;
exports.Instructions = Instructions;
exports.Play = Play;
exports.Welcome = Welcome;
