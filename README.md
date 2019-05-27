# ubsub-client

[![Build Status](https://travis-ci.org/ubsub/ubsub-client.svg?branch=master)](https://travis-ci.org/ubsub/ubsub-client)
[![npm](https://img.shields.io/npm/v/ubsub.svg)](https://www.npmjs.com/package/ubsub)
[![npm](https://img.shields.io/npm/l/ubsub.svg)](https://www.npmjs.com/package/ubsub)

The ubsub-client is a nodejs module to easily connect to send and receive events from [UbSub](https://ubsub.io) using sockets and https via CLI.

**NOTICE:** This package is now ONLY the cli.  API and streaming functions have been broken out into [libubsub](https://github.com/ubsub/libubsub)

# Using

## Installing CLI

### With npm

To use the `ubsub` CLI on your command line, make sure you have a recent version of [NodeJS](https://nodejs.org/en/) installed, and then run:

```bash
npm install -g ubsub
ubsub login
```

Once installed, you can run `ubsub help` from command line to see help output.

### Static build

There are also static builds for mac, linux, and windows in the [releases](https://github.com/ubsub/ubsub-client/releases) section.

## Commands

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

### Piping stdin to a topic

You can also pipe stdin (or a file) to a topic.

```bash
# Piping and following syslog to a topic
tail -f /var/log/syslog | ubsub pipe <topicId>
```

### Managing Templates

You're able to completely manage templates via the CLI client.

Get existing template:
```bash
ubsub templates get --id <id>
```

Upload a template (will create new if `--id` is unspecified):
```bash
# Update
ubsub templates push --id <id> filename.js

# Create new
ubsub templates push --lang JSVM --name test filename.js
```

### Other commands

Other useful commands include things like:

 * topics - View list of all topics and subscriptions
 * events - List all historic events
 * tokens - Manage and list tokens

For a full list of features, run: `ubsub --help`



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

