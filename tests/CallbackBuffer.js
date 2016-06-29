var test = require('tape');

test("CallbackBuffer", function (t) {
  var CallbackBuffer = require('../src/CallbackBuffer');
  var callbackBuffer;
  var responses;

  t.test("should not call callbacks immedately", function (t) {
    callbackBuffer = new CallbackBuffer();
    responses = [];

    var responses = [];

    callbackBuffer.add(function() { responses.push('call'); });
    t.deepEqual(responses, []);

    t.end();
  });

  t.test("should trigger callback when they are released", function (t) {
    callbackBuffer = new CallbackBuffer();
    responses = [];

    var responses = [];

    var id1 = callbackBuffer.add(function() { responses.push('call1'); });
    var id2 = callbackBuffer.add(function() { responses.push('call2'); });

    callbackBuffer.release(id1);
    t.deepEqual(responses, ['call1']);

    callbackBuffer.release(id2);
    t.deepEqual(responses, ['call1', 'call2']);

    t.end();
  });

  t.test("release callbacks in order", function (t) {
    callbackBuffer = new CallbackBuffer();
    responses = [];

    var id1 = callbackBuffer.add(function() { responses.push('call1'); });
    var id2 = callbackBuffer.add(function() { responses.push('call2'); });

    callbackBuffer.release(id2);
    t.deepEqual(responses, []);

    callbackBuffer.release(id1);
    t.deepEqual(responses, ['call1', 'call2']);

    t.end();
  });

  t.test("throw an error when a bad identifier is passed", function (t) {
    callbackBuffer = new CallbackBuffer();
    responses = [];

    var id = callbackBuffer.add(function() { responses.push('call'); });
    t.throws(
      function() {
        callbackBuffer.release('asdfasdfa')
      },
      new Error('Bad identifier "asdfasdfa"')
    );

    callbackBuffer.release(id);
    t.deepEqual(responses, ['call']);

    t.end();
  });
});
