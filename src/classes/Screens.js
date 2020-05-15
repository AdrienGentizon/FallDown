const pixi = require('pixi.js');

function welcome(container) {
  const msg = new pixi.Text('FALL_DOWN', { fontFamily: 'Press Start 2P' });
  msg.position.set((container._width - msg.width) / 2, container._height / 2);
  container.addChild(msg);
}

exports.welcome = welcome;
