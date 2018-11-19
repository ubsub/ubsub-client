const chalk = require('chalk');
const { assertGetClient, catchError } = require('./authUtil');

exports.command = 'info';
exports.desc = 'Output info about current user';

exports.handler = function cmdInfo(args) {
  const api = assertGetClient(args).getApi();

  if (args.v)
    console.error(chalk.dim('Fetching user info...'));

  api.getUser()
    .then(user => {
      console.error(`${chalk.dim('TokenId: ')}${api.tokenId()}`);
      console.error(`${chalk.dim('UserId:  ')}${user.id}`);
      console.error(`${chalk.dim('Created: ')}${user.createdAt}`);
      console.error(`${chalk.dim('Url:     ')}${api.routerUrl()}`);
    }).catch(catchError);
};
