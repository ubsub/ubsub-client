#!/usr/bin/env node
const yargs = require('yargs');
const inquirer = require('inquirer');
const axios = require('axios');
const Client = require('./lib/client');
const Ubsub = require('./index');
const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const chalk = require('chalk');


const CONFIG_PATH = `${os.homedir()}/.ubsub`;
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH))
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return null;
}
function assertGetClient(args) {
  if (args.user && args.userkey)
    return Ubsub(args.user, args.userkey);

  const cfg = loadConfig();
  if (!cfg) {
    console.error('No configuration found. Please run `ubsub login`');
    process.exit(1);
  }
  return Ubsub(cfg.userId, cfg.userKey);
}

function cmdLogin(args) {
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
    const c = Client(answers.userId, answers.userKey);
    return c.getTopics()
      .then(() => answers)
      .catch(err => {
        throw Error(`Unable to login user: ${err.message}`);
      });
  }).then(answers => {
    console.error(`Saving configuration to: ${CONFIG_PATH}`);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(answers, null, '\t'));
  }).catch(err => {
    console.error(err.message);
  });
}

function cmdLogout() {
  try {
    fs.unlinkSync(CONFIG_PATH);
    console.error('Config deleted');
  } catch (err) {
    console.error(`Error deleting config: ${err.message}`);
  }
}

function cmdListen(args) {
  console.error(`Listening to ${args.topic}...`);
  return assertGetClient(args)
    .listen(args.topic, event => {
      console.log(JSON.stringify(event));
    });
}

function cmdForward(args) {
  console.error(`${chalk.bold('Forwarding')}: ${chalk.red(args.topic)} -> ${chalk.green(args.url)}...`);
  return assertGetClient(args)
    .listen(args.topic, event => {
      console.log(JSON.stringify(event));
      axios({
        method: args.method.toUpperCase(),
        url: args.url,
        validateStatus: null,
      }).then(resp => {
        console.error(chalk.blue(`  Received ${resp.status}`));
      });
    });
}

function cmdWebhook(args) {
  const api = assertGetClient(args).getApi();
  return api.createTopic(args.name || `Webhook${~~(Math.random() * 1000)}`, !args.keyless)
    .then(topic => {
      const sock = cmdForward(_.assign({
        topic: topic.id,
      }, args));

      const url = `https://router.ubsub.io/event/${topic.id}${topic.key ? `?key=${topic.key}` : ''}`;
      console.error(`${chalk.bold('Endpoint')}: ${chalk.underline(url)}`);

      // Hook on to SIGINT for cleanup
      process.on('SIGINT', () => {
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
}

/* eslint no-unused-vars: off */
/* eslint arrow-body-style: off */
const args = yargs
  .usage('$0 <cmd> [args]')
  .boolean('v')
  .alias('v', 'verbose')
  .string('user')
  .describe('user', 'User id to override one that you logged in to')
  .string('userkey')
  .describe('userkey', 'User key to override your logged in account')
  .command('login', 'Login to ubsub', {}, cmdLogin)
  .command('logout', 'Logout (delete config)', {}, cmdLogout)
  .command('listen <topic>', 'Listen to a topic and output to terminal', {}, cmdListen)
  .command('forward <topic> <url>', 'Forward an event from a topic to a url', sub => {
    return sub
      .string('method')
      .describe('method', 'HTTP method to push to url with')
      .default('method', 'POST');
  }, cmdForward)
  .command('webhook <url>', 'Creates a webhook URL that will forward an event to the provided URL', sub => {
    return sub
      .string('method')
      .describe('method', 'HTTP method to push to the url with')
      .default('method', 'POST')
      .string('name')
      .describe('name', 'Name to give webhook on ubsub')
      .boolean('keep')
      .describe('keep', 'Do not delete topic on exit')
      .boolean('keyless')
      .describe('keyless', 'Do not generate key for endpoint');
  }, cmdWebhook)
  .command('help <command>', 'Show help for a command', {}, () => args.showHelp())
  .demandCommand()
  .recommendCommands()
  .help('help')
  .alias('help', 'h')
  .env('UBSUB')
  .epilog(`You can set login information via environmental variables,
    eg. UBSUB_USER, UBSUB_USERKEY`);

args.parse();
