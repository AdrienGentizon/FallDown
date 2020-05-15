class Keyboard {
  static KeyCodes = {
    SPACE: ' ',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
  };
  constructor(keys) {
    for (const [key, value] of Object.entries(keys)) {
      this[key] = new Key(value);
    }
  }
}

class Key {
  constructor(value) {
    this.value = value;
    this.isDown = false;
    this.isUp = true;
    this.press = undefined;
    this.release = undefined;
    this.subscribe();
  }

  subscribe() {
    const downListener = this.downHandler.bind(this);
    const upListener = this.upHandler.bind(this);

    window.addEventListener('keydown', downListener, false);
    window.addEventListener('keyup', upListener, false);
  }

  unsubscribe() {
    window.removeEventListener('keydown', downListener);
    window.removeEventListener('keyup', upListener);
  }

  downHandler(event) {
    if (event.key === this.value) {
      if (this.isUp && this.press) this.press();
      this.isDown = true;
      this.isUp = false;
      event.preventDefault();
    }
  }

  upHandler(event) {
    if (event.key === this.value) {
      if (this.isDown && this.release) this.release();
      this.isDown = false;
      this.isUp = true;
      event.preventDefault();
    }
  }
}

module.exports = Keyboard;
