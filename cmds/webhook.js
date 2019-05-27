const chalk = require('chalk');
const _ = require('lodash');
const { assertGetClient } = require('./authUtil');
const cmdForward = require('./forward').handler;

exports.command = 'webhook <url>';
exports.desc = 'Creates a webhook URL that will forward an event to the provided URL';

exports.builder = sub => sub
  .boolean('reconnect')
  .describe('reconnect', 'Automatically reconnect socket upon disconnect-error')
  .string('method')
  .describe('method', 'HTTP method to push to the url with')
  .default('method', 'POST')
  .string('name')
  .describe('name', 'Name to give webhook on ubsub')
  .boolean('keep')
  .describe('keep', 'Do not delete topic on exit')
  .boolean('keyless')
  .describe('keyless', 'Do not generate key for endpoint');

exports.handler = function cmdWebhook(args) {
  const api = assertGetClient(args).getApi();
  return api.createTopic(args.name || `Webhook${~~(Math.random() * 1000)}`, !args.keyless)
    .then(topic => {
      cmdForward(_.assign({
        topic: topic.id,
      }, args)).then(sock => {
        const url = `${api.routerUrl()}/event/${topic.id}${topic.key ? `?key=${topic.key}` : ''}`;
        console.error(`${chalk.bold('Endpoint')}: ${chalk.underline(url)}`);

        // Hook on to SIGINT for cleanup
        process.on('SIGINT', () => {
          sock.close();
          if (!args.keep) {
            console.error('Deleting topic...');
            api.deleteTopic(topic.id)
              .then(() => process.exit(0))
              .catch(err => {
                console.error(err.message);
                process.exit(1);
              });
          } else process.exit(0);
        });
      });
    });
};
