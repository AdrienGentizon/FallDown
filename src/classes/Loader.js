const pixi = require('pixi.js');

class Loader {
  constructor(urls, callback) {
    this._urls = urls;
    this._callback = callback;
    this._sprites = {};
    this._loader;
    this._start();
  }

  _start() {
    this._loader = pixi.Loader.shared;
    for (const url of this._urls) {
      this._loader.add(url);
    }
    this._loader.load();
    this._loader.onProgress.add(() => {}); // called once per loaded/errored file
    this._loader.onError.add(() => {}); // called once per errored file
    this._loader.onLoad.add((loader) => {}); // called once per loaded file
    this._loader.onComplete.add((loader) => {
      for (const resource in loader.resources) {
        const sprite = new pixi.Sprite(loader.resources[resource].texture);
        this._sprites[resource] = sprite;
      }
      this._callback(this._sprites);
    }); // called once when the queued resources all load.
  }
}

module.exports = Loader;
