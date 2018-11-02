const readline = require('readline');
const { assertGetClient } = require('./authUtil');

exports.command = 'pipe <topic>';
exports.desc = 'Pipe stdin to a given topic.  Will try to parse JSON, or encapsulate';

exports.builder = sub => sub
  .string('key')
  .describe('key', 'Key for topic')
  .string('name')
  .describe('name', 'Name to associate with the application');

exports.handler = function cmdPipe(args) {
  const cb = assertGetClient(args).pipe(args.topic, args.key);
  const rl = readline.createInterface({
    input: process.stdin,
  });
  rl.on('line', line => {
    console.log(line);

    let data = null;
    try {
      data = JSON.parse(line);
    } catch (e) {
      data = {
        line,
      };
    }
    if (args.name)
      data.name = args.name;
    cb(data);
  });
  rl.on('close', () => {
    cb.sock.disconnect();
  });
};
