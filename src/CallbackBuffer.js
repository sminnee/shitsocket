/**
 * Create a buffer of callbacks that can be released in order
 */
function CallbackBuffer() {
  this.callbacks = {};
  this.isReleased = {};
  this.orderedBuffer = [];
  this.nextIdentifier = 0;
}

CallbackBuffer.prototype.add = function(callback) {
  this.nextIdentifier++;
  var identifier = 'cb' + this.nextIdentifier;

  this.callbacks[identifier] = callback;
  this.orderedBuffer.push(identifier);

  return identifier;
}

CallbackBuffer.prototype.release = function(identifier) {
  if (!this.callbacks[identifier]) {
    throw new Error('Bad identifier "' + identifier + '"');
  }

  // Mark this callback as released
  this.isReleased[identifier] = true;

  // Trigger any next released callbacks in order
  var nextIdentifier;
  while (this.orderedBuffer.length && this.isReleased[this.orderedBuffer[0]]) {
    nextIdentifier = this.orderedBuffer[0];
    this.orderedBuffer.splice(0, 1);

    this.callbacks[nextIdentifier]();

    delete this.callbacks[nextIdentifier];
    delete this.isReleased[nextIdentifier];
  }
}

module.exports = CallbackBuffer;
