# ubsub-client

[![Build Status](https://travis-ci.org/zix99/ubsub-client.svg?branch=master)](https://travis-ci.org/zix99/ubsub-client)
[![npm](https://img.shields.io/npm/v/ubsub.svg)](https://www.npmjs.com/package/ubsub)
[![npm](https://img.shields.io/npm/l/ubsub.svg)](https://www.npmjs.com/package/ubsub)

The ubsub-client is a nodejs module to easily connect to send and receive events from [UbSub](https://ubsub.io) using sockets and https.

It also provides convenient wrappers to forward HTTP connections behind a NAT, to easily give you an endpoint to forward
events from the public internet to a local network.

# Using

## Installing CLI

To use the `ubsub` CLI on your command line, make sure you have a recent version of [NodeJS](https://nodejs.org/en/) installed, and then run:

```bash
npm install -g ubsub
ubsub login
```

Once installed, you can run `ubsub help` from command line to see help output.

### Outputting events to the terminal

```bash
ubsub listen <topic id>
```

### Forwarding to an internal URL

One of the great uses is the ability to forward an external event URL to something behind your firewall and/or NAT.

```bash
ubsub forward <topic id> http://localhost:4000/path/to/it --method POST
```

This will invoke the endpoint every time the public UbSub URL is hit.

### Creating external URL to forward

This is similar to forward, but will create a new topic automatically to be hit.

```bash
ubsub webhook http://localhost:4000 [--method POST] [--name mywebhook] [--keyless]
```

The URL for this topic will be output after starting, and deleted automatically upon exist (unless `--keep` is specified).

## Installing for App Use

Installing into your project:

```bash
npm install --save ubsub-client
```

See [examples/](examples/) for some sample uses.

### Listening to a Topic

```js
const ubsub = require('ubsub')(<user id>, <user secret>, [opts]);

ubsub.listen(<topic id>, (event) => {
	console.log('received event ' + JSON.stringify(event));
});
```

### Forwarding a Topic to an HTTP endpoint

```js
const ubsub = require('ubsub')(<user id>, <user secret>, [opts]);

ubsub.forward(<topic id>, 'http://localhost:5000', {..optional axios opts..});
```

## Options

`reconnectOnError`: Whether or not to reconnect on a fatal error. This is separate from the default SocketIO reconnect. (default: true)

`reconnectOnErrorDelay`: Number of milliseconds to delay the reconnect on error (default: 5000)

# License

Copyright (c) 2017 Christopher LaPointe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

