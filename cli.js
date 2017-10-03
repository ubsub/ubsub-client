#!/usr/bin/env node
const yargs = require('yargs');
const inquirer = require('inquirer');
const axios = require('axios');
const Client = require('./lib/client');
const Ubsub = require('./index');
const fs = require('fs');
const os = require('os');


const CONFIG_PATH = `${os.homedir()}/.ubsub`;
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH))
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return null;
}
function assertGetClient(args) {
  if (args.user && args.key)
    return Ubsub(args.user, args.key);

  const cfg = loadConfig();
  if (!cfg) {
    console.error('No configuration found. Please run `ubsub login`');
    process.exit(1);
  }
  return Ubsub(cfg.userId, cfg.userKey);
}

function cmdLogin(args) {
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
  assertGetClient(args)
    .listen(args.topic, event => {
      console.log(JSON.stringify(event));
    });
}

function cmdForward(args) {
  console.error(`Listening to ${args.topic}...`);
  assertGetClient(args)
    .listen(args.topic, event => {
      console.log(JSON.stringify(event));
      axios({
        method: args.method.toUpperCase(),
        url: args.url,
        validateStatus: null,
      }).then(resp => {
        console.error(`  Received ${resp.status}`);
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
  .string('key')
  .describe('key', 'User key to override your logged in account')
  .command('login', 'Login to ubsub', {}, cmdLogin)
  .command('logout', 'Logout (delete config)', {}, cmdLogout)
  .command('listen <topic>', 'Listen to a topic and output to terminal', {}, cmdListen)
  .command('forward <topic> <url>', 'Forward an event from a topic to a url', sub => {
    return sub
      .string('method')
      .describe('method', 'HTTP method to push to url with')
      .default('method', 'POST');
  }, cmdForward)
  .demandCommand()
  .help('help')
  .alias('help', 'h')
  .env('UBSUB');

args.parse();
