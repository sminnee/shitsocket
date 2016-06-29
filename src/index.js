var CallbackBuffer = require('./CallbackBuffer');

/**
 * Create a wrapper around a socket that introduces lag and jitter
 * @param socket The Socket.IO socket object
 * @param delay The maximum delay in ms to add to any messages. Defaults to 500.
 */
function ShitSocket (socket, delay) {
  this.socket = socket;
  this.delay = delay || 500;
  this.buffer = new CallbackBuffer();
  this.originalCallbacks = [];
  this.nestedCallbacks = [];
}

/**
 * Call the given callback in response to incoming messages, after a delay
 */
ShitSocket.prototype.on = function (message, callback) {
  var self = this;

  var nestedCallback = function (data) {
    var identifier = self.buffer.add(function () {
      callback(data);
    });

    setTimeout(function() {
      self.buffer.release(identifier);
    }, this.getNextDelay());
  }

  this.originalCallbacks.push(callback);
  this.nestedCallbacks.push(callback);

  this.socket.on(message, nestedCallback);
}

ShitSocket.prototype.off = function (message, callback) {
  // Find the nested callback that matches the given original one
  var callbackIndex = this.originalCallbacks.indexOf(callback);
  if (callbackIndex !== -1) {
    var matchingCallback = this.nestedCallbacks[callbackIndex];
    this.originalCallbacks.splice(callbackIndex, 1);
    this.nestedCallbacks.splice(callbackIndex, 1);

    this.socket.off(message, callback);
  }
}

/**
 * Emit the given message with the given data after a delay
 */
ShitSocket.prototype.emit = function (message, data) {
  var self = this;

  var identifier = this.buffer.add(function () {
    self.socket.emit(message, data);
  });

  setTimeout(function() {
    self.buffer.release(identifier);
  }, this.getNextDelay());
}

/**
 * Return the amount of time to delay the next message by in ms.
 * Called internally; can be overridden for testing and other purposes
 */
ShitSocket.prototype.getNextDelay = function () {
  return Math.random() * this.delay;
}

module.exports = ShitSocket;
