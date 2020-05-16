const pixi = require('pixi.js');
const Vector = require('./Vector');

class Block {
  constructor(sprite, game, value = -1) {
    this._sprite = sprite;
    this._game = game;
    this._value = value;
    this._isStopped = false;
    this._position = new Vector(0, 0);
    this._prevPosition = new Vector(0, 0);
    this._containers = [];

    if (this._game.DEBUG) {
      this.makeDebugShape();
    }
  }

  // GETTERS & SETTERS

  get isStopped() {
    return this._isStopped;
  }
  set isStopped(state) {
    this._isStopped = state;
  }

  get sprite() {
    return this._sprite;
  }

  get value() {
    return this._value;
  }

  addTo(container, u = new Vector(100, 0)) {
    this._containers.push(container);
    container.addChild(this._sprite);
    this.translateX(u.x);
    this.translateY(u.y);
    // this._sprite.x = u.x;
    // this._sprite.y = u.y;
    // this._position.x = Math.floor(u.x);
    // this._position.y = Math.floor(u.y);
    // this._prevPosition.x = Math.floor(u.x);
    // this._prevPosition.y = Math.floor(u.y);
  }

  // METHODS

  checkCollisions(block) {
    if (block !== this) {
      if (this._sprite.y > block.sprite.y - this._sprite.height && this._sprite.x == block.sprite.x) {
        // this._sprite.y = this._prevPosition.y;
        // this._position.y = Math.floor(this._sprite.y);
        this.translateY(this._prevPosition.y);
        this._isStopped = true;
      }
    }
  }

  checkEdges() {
    if (this._sprite.x < 0 || this._sprite.x + this._sprite.width > this._game.w) {
      // this._sprite.x = this._prevPosition.x;
      // this._position.x = Math.floor(this._sprite.x);
      this.translateX(this._prevPosition.x);
    }
  }

  checkGround() {
    if (this._sprite.y > this._game.groundLevel - this._sprite.height) {
      // this._sprite.y = this._game.h - this._sprite.height - 48;
      // this._position.y = Math.floor(this._sprite.y);
      this.translateY(this._prevPosition.y);

      this._isStopped = true;
    }
  }

  kill() {
    for (const container of this._containers) {
      container.removeChild(this._sprite);
    }
  }

  makeDebugShape() {
    this._debugGraphics = new pixi.Graphics();
    this._debugGraphics.lineStyle(1, 0xff0000, 1);
    this._debugGraphics.beginFill(0x000000, 0);
    this._debugGraphics.drawRect(this._sprite.x, this._sprite.y, this._sprite.width, this._sprite.height);
    this._debugGraphics.endFill();
    this._sprite.addChild(this._debugGraphics);
  }

  moveX(dx) {
    this._prevPosition.x = this._position.x;
    this._sprite.x += dx;
    this._position.x = Math.floor(this._sprite.x);
  }

  moveY(dy) {
    this._prevPosition.y = this._position.y;
    this._sprite.y += dy;
    this._position.y = Math.floor(this._sprite.y);
  }

  translateX(x) {
    this._prevPosition.x = this._position.x;
    this._sprite.x = x;
    this._position.x = Math.floor(this._sprite.x);
  }

  translateY(y) {
    this._prevPosition.y = this._position.y;
    this._sprite.y = y;
    this._position.y = Math.floor(this._sprite.y);
  }

  // STATIC METHODS

  static factory(blueprint) {
    /*
      blueprint = {
      dropOffLocation: Vector(x, y),
      blockTypes: [Block.CONST],
      }
    */
    const n = Math.floor(blueprint.blockTypes.length * Math.random());
    return blueprint.blockTypes[n];
  }
}

module.exports = Block;
