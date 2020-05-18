class Keyboard {
  static KeyCodes = {
    SPACE: ' ',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    ESC: 'Escape',
    ENTER: 'Enter',
  };
  constructor(keys) {
    for (const [key, value] of Object.entries(keys)) {
      this[key] = new Key(value);
    }
    this.prompt = {
      x: 0,
      y: 0,
      moveCursor: function (x, y) {
        this.x += x;
        this.y += y;

        this.x %= this.size;
        this.y %= this.alphabet.length;

        if (this.x === -1) {
          this.x = this.size - 1;
        }

        if (this.y === -1) {
          this.y = this.alphabet.length - 1;
        }

        this.cache[this.x] = this.y;
      },
      size: 0,
      cache: [],
      toString: function () {
        let output = '';
        for (const letter of this.cache) {
          output += this.alphabet[letter];
        }
        return output;
      },
      clear: function () {
        this.cache = [];
      },
      addInput: function (input) {
        // check if input is in alphabet
        this.cache.push(input);
      },
      alphabet: [
        '_',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ],
    };
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
