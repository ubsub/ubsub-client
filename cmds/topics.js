const chalk = require('chalk');
const _ = require('lodash');
const { assertGetClient } = require('./authUtil');

exports.command = 'topics';
exports.desc = 'List registered topics on ubsub';

exports.handler = function cmdListTopics(args) {
  const api = assertGetClient(args).getApi();
  console.error('Topics:');
  return api.getTopics()
    .then(topics => {
      _.each(topics, topic => {
        console.error(`  [${chalk.greenBright(topic.id)}] ${chalk.green(topic.name || topic.id)}`);
        _.each(topic.subscriptions, sub => {
          console.error(`    [${chalk.blueBright(sub.id)}] ${chalk.blue(sub.name || sub.id)}`);
        });
      });
    });
};
