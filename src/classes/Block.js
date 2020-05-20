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
    this._vertices = [];
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
  }

  // METHODS
  checkCollisionsY(block) {
    if (block !== this) {
      if (this._sprite.y > block.sprite.y - this._sprite.height && this._sprite.x == block.sprite.x) {
        this.translateY(this._game.findValidPosition(this._position).y);
        this._isStopped = true;
        return true;
      }
      return false;
    }
  }

  checkCollisionsX(block) {
    if (block !== this) {
      for (const vertex of this._vertices) {
        if (
          Vector.isInside(
            vertex,
            block.sprite.x,
            block.sprite.y,
            block.sprite.x + block.sprite.width,
            block.sprite.y + block.sprite.height
          )
        ) {
          this.translateX(this._prevPosition.x);
          return true;
        }
      }
      return false;
    }
  }

  checkEdges() {
    if (this._sprite.x <= 0 || this._sprite.x + this._sprite.width >= this._game.w) {
      this.translateX(this._prevPosition.x);
    }
  }

  checkGround() {
    if (this._sprite.y > this._game.groundLevel - this._sprite.height) {
      this.translateY(this._game.findValidPosition(this._position).y);
      this._isStopped = true;
      return true;
    }
    return false;
  }

  computeVertices() {
    this._vertices = [
      new Vector(this._sprite.x, this._sprite.y),
      new Vector(this._sprite.x + this._sprite.width, this._sprite.y),
      new Vector(this._sprite.x, this._sprite.y + this._sprite.height),
      new Vector(this._sprite.x + this._sprite.width, this._sprite.y + this._sprite.height),
    ];
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
    this.computeVertices();
  }

  moveY(dy) {
    this._prevPosition.y = this._position.y;
    this._sprite.y += dy;
    this._position.y = Math.floor(this._sprite.y);
    this.computeVertices();
  }

  translateX(x) {
    this._prevPosition.x = this._position.x;
    this._sprite.x = x;
    this._position.x = Math.floor(this._sprite.x);
    this.computeVertices();
  }

  translateY(y) {
    this._prevPosition.y = this._position.y;
    this._sprite.y = y;
    this._position.y = Math.floor(this._sprite.y);
    this.computeVertices();
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
