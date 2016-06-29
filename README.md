ShitSocket
==========

[![Build Status](https://travis-ci.org/sminnee/shitsocket.svg?branch=master)](https://travis-ci.org/sminnee/shitsocket)

ShitSocket emaulates Socket.io-based websocket connections over laggy connections by adding random delays
to the propogation of messages.

Message ordering is preserved; where the delay of the 1st message is greater than the 2nd, the 2nd will be
held up until the first is ready to send. This will have the effect of clustering messages, which mimics the
behavior of slower network connections reasonably well.

Why would you do this? ShitSocket is designed to help you write websocket code that is resilient to slower
network connections, by giving you a good test case on your local development environment.

Usage
-----

Where you would normally connect to a socket.io socket:

```javascript
var io = require('socket.io');

var socket = io.connect('http://example.org');
```

Instead wrap the `connect()` call in a ShitSocket constructor:

```javascript
var io = require('socket.io');
var socket = io.connect('http://example.org');
var ShitSocket = require('shitsocket');

var socket = new ShitSocket(io.connect('http://example.org'));
```

By default, the delays on message will be a random amount between 0 and 500ms. To change the upper limit,
pass a 2nd argument to the ShitSocket constructor.

```javascript
var okaySocket = new ShitSocket(io.connect('http://example.org'), 50);
var awfulSocket = new ShitSocket(io.connect('http://example.org'), 5000);
```
