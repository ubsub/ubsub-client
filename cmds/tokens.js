const chalk = require('chalk');
const _ = require('lodash');
const columnify = require('columnify');
const { assertGetClient, catchError } = require('./authUtil');

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
  .describe('client', 'The client the token belongs to')
  .string('client')
  .describe('show', 'Show secrets')
  .boolean('show');

exports.handler = function cmdTokens(args) {
  const api = assertGetClient(args).getApi();

  if (!args.command || args.command === 'list') {
    console.error('Tokens:');
    return api.getTokens()
      .then(tokens => {
        console.error(columnify(_.map(tokens, x => ({
          id: chalk.dim(x.id),
          name: chalk.green(x.name),
          secret: !args.show ? chalk.dim('<Hidden>') : chalk.cyan(x.secret),
          clientId: chalk.yellow(x.client_id || '-'),
          scope: chalk.blue(x.scope),
        }))));
      }).catch(catchError);
  } else if (args.command === 'create') {
    return api.createToken(args.name, args.scope, args.client)
      .then(token => {
        console.error('Token created:');
        console.error(`Id:     ${chalk.green(token.id)}`);
        console.error(`Secret: ${chalk.cyan(token.secret)}`);
      }).catch(catchError);
  }
  console.error(`Unknown command: ${args.command}`);
  return null;
};
