const chalk = require('chalk');
const _ = require('lodash');
const { assertGetClient } = require('./authUtil');

exports.command = 'tokens [command]';
exports.desc = 'List tokens on ubsub';

exports.builder = sub => sub
  .positional('command', {
    describe: 'Command to execute for token',
    type: 'string',
    default: 'list',
    choices: ['list', 'create'],
  })
  .describe('name', 'Name to assign when creating a token')
  .string('name')
  .describe('scope', 'The scope to create the token with')
  .string('scope')
  .default('scope', 'user topic.* subscription.* event.* template.*')
  .describe('show', 'Show secrets')
  .boolean('show');

exports.handler = function cmdTokens(args) {
  const api = assertGetClient(args).getApi();

  if (!args.command || args.command === 'list') {
    console.error('Tokens:');
    return api.getTokens()
      .then(tokens => {
        _.each(tokens, t => {
          console.error(`  [${chalk.dim(t.id)}] ${chalk.green(t.name)} ${!args.show ? chalk.dim('<Hidden>') : chalk.cyan(t.secret)} (${chalk.blue(t.scope)})`);
        });
      }).catch(err => {
        console.error(chalk.red(`Error: ${err.message}`));
      });
  } else if (args.command === 'create') {
    return api.createToken(args.name, args.scope)
      .then(token => {
        console.error('Token created:');
        console.error(`Id:     ${token.id}`);
        console.error(`Secret: ${token.secret}`);
      }).catch(err => {
        console.error(chalk.red(`Error: ${err.message}`));
      });
  }
  console.error(`Unknown command: ${args.command}`);
  return null;
};
