var test = require('tape');

test("ShitSocket", function (t) {
  var ShitSocket = require('../src/ShitSocket');
  var shitSocket;
  var nestedSocket;
  var calls;

  // Simple nested socket implementation
  nestedSocket = {
    on: function (message, callback) {
      callbacks.push(callback);
    },
    off: function (message, callback) {
      callbacks.splice(callbacks.indexOf(callback), 1);
    },
    emit: function (message, data) {
      calls.push(['emit', message, data]);
    },
  };

  t.test("should delay responses", function (t) {
    t.plan(2);

    calls = [];
    callbacks = [];
    shitSocket = new ShitSocket(nestedSocket);

    shitSocket.getNextDelay = function() { return 10; }
    shitSocket.emit('m', 'd');

    setTimeout(function() {
      t.deepEqual(calls, []);
    }, 5);

    setTimeout(function() {
      t.deepEqual(calls, [ ['emit', 'm', 'd'] ]);
      t.end();
    }, 15);
  });

  t.test("should delay responses to ensure order is preserved", function (t) {
    t.plan(3);

    calls = [];
    callbacks = [];
    shitSocket = new ShitSocket(nestedSocket);

    shitSocket.getNextDelay = function() { return 30; }
    shitSocket.emit('m1', 'd1');

    shitSocket.getNextDelay = function() { return 10; }
    shitSocket.emit('m2', 'd2');

    setTimeout(function() {
      t.deepEqual(calls, []);
    }, 5);

    setTimeout(function() {
      t.deepEqual(calls, []);
    }, 15);

    setTimeout(function() {
      t.deepEqual(calls, [
        ['emit', 'm1', 'd1'],
        ['emit', 'm2', 'd2'],
      ]);
      t.end();
    }, 35);
  });

  t.test("should delay callbacks", function (t) {
    t.plan(2);

    calls = [];
    callbacks = [];
    shitSocket = new ShitSocket(nestedSocket);
    shitSocket.getNextDelay = function() { return 10; }

    shitSocket.on('m', function (data) {
      calls.push(['on', 'm', data]);
    });
    callbacks[0]('d1');


    setTimeout(function() {
      t.deepEqual(calls, []);
    }, 5);

    setTimeout(function() {
      t.deepEqual(calls, [ ['on', 'm', 'd1' ]]);
      t.end();
    }, 15);

  });

  t.test("should allow adding and removing of callbacks", function (t) {
    calls = [];
    callbacks = [];
    shitSocket = new ShitSocket(nestedSocket);

    var cb = function(data) {};
    shitSocket.on('m', cb);
    t.equal(callbacks.length, 1);
    shitSocket.off('m', cb);
    t.equal(callbacks.length, 0);

    t.end();
  });
});
