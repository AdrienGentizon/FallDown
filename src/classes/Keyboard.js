'use strict';

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
      index: 0,
      nextLetter: function (x) {
        this.index += x;

        this.index %= this.size;

        if (this.index === -1) {
          this.x = this.size - 1;
        }
      },
      nextChar: function (y) {
        this.chars[this.index] += y;

        this.chars[this.index] %= this.alphabet.length;

        if (this.chars[this.index] === -1) {
          this.chars[this.index] = this.alphabet.length - 1;
        }
      },
      size: 0,
      chars: [],
      toString: function () {
        let output = '';
        for (const letter of this.chars) {
          output += this.alphabet[letter];
        }
        return output;
      },
      clear: function () {
        this.cache = [];
      },
      addInput: function (input) {
        // check if input is in alphabet
        this.chars.push(input);
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
