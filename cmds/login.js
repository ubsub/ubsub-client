const inquirer = require('inquirer');
const chalk = require('chalk');
const Ubsub = require('../index');
const authUtil = require('./authUtil');

exports.command = 'login';
exports.desc = 'Login to ubsub';

exports.handler = function cmdLogin(args) {
  console.log('Please login with your userId and key.');
  console.log('You can find your key on your user dashboard at https://ubsub.io');
  inquirer.prompt([
    {
      name: 'userId',
      message: 'UserId',
      default: args.u,
    },
    {
      name: 'userKey',
      message: 'userKey',
    },
  ]).then(answers => {
    const c = Ubsub(answers.userId, answers.userKey).getApi();
    return c.getUser()
      .then(() => answers)
      .catch(err => {
        throw Error(`Unable to login user: ${chalk.red(err.message)}`);
      });
  }).then(answers => {
    authUtil.saveCredentials(answers.userId, answers.userKey);
  }).catch(err => {
    console.error(err.message);
  });
};