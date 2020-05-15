const Vector = require('./Vector');

class Block {
  constructor(sprite, game, value) {
    this.sprite = sprite;
    this._game = game;
    this._value = value;
    this.isStopped = false;
    this._prevPosition = new Vector(0, 0);
    this._containers = [];
  }

  get value() {
    return this._value;
  }

  addTo(container, u = new Vector(100, 0)) {
    this._containers.push(container);
    container.addChild(this.sprite);
    this.sprite.x = u.x;
    this.sprite.y = u.y;
    this._prevPosition.x = u.x;
    this._prevPosition.y = u.y;
  }

  kill(parent) {
    console.log(parent.indexOf(this));

    this.parent = parent.splice(parent.indexOf(this));
    for (const container of this._containers) {
      container.removeChild(this.sprite);
    }
  }

  moveX(pixels) {
    this._prevPosition.x = this.sprite.x;
    this.sprite.x += pixels;
  }

  moveY(pixels) {
    this._prevPosition.y = this.sprite.y;
    this.sprite.y += pixels;
  }

  checkEdges() {
    // BOTTOM
    if (this.sprite.y > this._game.h - this.sprite.height - 48) {
      this.sprite.y = this._game.h - this.sprite.height - 48;
      this.isStopped = true;
    }
    //SIDES
    if (this.sprite.x < 0 || this.sprite.x + this.sprite.width > this._game.w) {
      this.sprite.x = this._prevPosition.x;
    }
  }

  checkCollisions(block) {
    if (this.sprite.y > block.sprite.y - this.sprite.height && this.sprite.x == block.sprite.x) {
      this.sprite.y = block.sprite.y - this.sprite.height;
      this.isStopped = true;
    }
  }
  /*
blueprint = {
  dropOffLocation: Vector(x, y),
  blockTypes: [Block.CONST],
}
*/
  static factory(blueprint) {
    const n = Math.floor(blueprint.blockTypes.length * Math.random());
    return blueprint.blockTypes[n];
  }
}

module.exports = Block;
