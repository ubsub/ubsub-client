const chalk = require('chalk');
const { assertGetClient } = require('./authUtil');

exports.command = 'listen <topic>';
exports.desc = 'Listen to a topic and output to terminal';

exports.builder = sub => sub
  .boolean('create')
  .describe('create', 'Create a new topic rather than listening to existing')
  .boolean('keep')
  .describe('keep', 'Keep a newly created topic rather than deleting when done')
  .boolean('keyless')
  .describe('keyless', 'Do not assign a key of creating a topic')
  .boolean('format')
  .describe('format', 'Format outputted JSON');

exports.handler = function cmdListen(args) {
  const client = assertGetClient(args);
  const api = client.getApi();

  let topicGet = null;
  if (args.create)
    topicGet = api.createTopic(args.topic, !args.keyless);
  else
    topicGet = api.getTopicById(args.topic);

  return topicGet.then(topic => {
    const url = `${api.routerUrl()}/event/${topic.id}${topic.key ? `?key=${topic.key}` : ''}`;
    console.error(`${chalk.bold('Listening')}: [${chalk.greenBright(topic.id)}] ${chalk.green(topic.name || topic.id)}`);
    console.error(`${chalk.bold('Endpoint')}: ${chalk.underline(url)}`);

    const sock = client.listen(topic.id, event => {
      if (args.format)
        console.dir(event, { depth: null, colors: true });
      else
        console.log(JSON.stringify(event));
    });

    process.on('SIGINT', () => {
      sock.close();
      if (!args.keep && args.create) {
        console.error('Deleting topic...');
        api.deleteTopic(topic.id)
          .then(() => process.exit(0))
          .catch(err => {
            console.error(chalk.red(err.message));
            process.exit(1);
          });
      } else process.exit(0);
    });
  }).catch(err => {
    console.error(`Error listening to topic: ${chalk.red(err.message)}`);
    console.error(`Did you try to listen to a topic that does not exist? Try adding ${chalk.bold('--create')}`);
    process.exit(1);
  });
};
