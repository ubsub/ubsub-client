# ubsub-client

[![Build Status](https://travis-ci.org/zix99/ubsub-client.svg?branch=master)](https://travis-ci.org/zix99/ubsub-client)

The ubsub-client is a nodejs module to easily connect to send and receive events from [UbSub](https://ubsub.io) using sockets and https.

It also provides convenient wrappers to forward HTTP connections behind a NAT, to easily give you an endpoint to forward
events from the public internet to a local network.

# Using

## Installing

Installing into your project;

```
npm install --save ubsub-client
```

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

