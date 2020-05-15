class Vector {
  constructor(x = 0, y = 0) {
    try {
      if (isNaN(x) || isNaN(y)) {
        throw Vector`instanciation error: ${x} and ${y} arguments must be Numbers`;
      }
    } catch (error) {
      console.error(error);
    }

    this._x = x;
    this._y = y;
  }

  set y(y) {
    this._y = y;
  }

  get y() {
    return this._y;
  }

  set x(x) {
    this._x = x;
  }

  get x() {
    return this._x;
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  static div(vector, scalar) {
    if (scalar === 0) {
      throw 'Zero division';
    }
    return new Vector(vector.x / scalar, vector.y / scalar);
  }

  toString() {
    return `[Vector: (${this.x}, ${this.y})]`;
  }
}

module.exports = Vector;
