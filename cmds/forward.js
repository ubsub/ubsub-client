const chalk = require('chalk');
const axios = require('axios');
const { assertGetClient, catchError } = require('./authUtil');

exports.command = 'forward <topic> <url>';
exports.desc = 'Forward an event from a topic to a url';

exports.builder = sub => sub
  .boolean('reconnect')
  .describe('reconnect', 'Automatically reconnect socket upon disconnect-error')
  .string('method')
  .describe('method', 'HTTP method to push to url with')
  .default('method', 'POST');

exports.handler = function cmdForward(args) {
  const client = assertGetClient(args);
  const api = client.getApi();

  return api.getTopicByIdOrName(args.topic)
    .then(topic => {
      console.error(`${chalk.bold('Forwarding')}: ${chalk.red(topic.id)} -> ${chalk.green(args.url)}...`);
      return client
        .listen(topic.id, (event, { topicId }) => {
          console.log(JSON.stringify(event));
          axios({
            method: args.method.toUpperCase(),
            url: args.url,
            validateStatus: null,
            data: event,
            headers: {
              'X-Topic-Id': topicId,
            },
          }).then(resp => {
            console.error(chalk.blue(`  Received ${resp.status}`));
          }).catch(err => {
            console.error(chalk.red(err.message));
          });
        });
    }).catch(catchError);
};
