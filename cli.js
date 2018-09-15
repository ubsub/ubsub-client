#!/usr/bin/env node
const yargs = require('yargs');
const inquirer = require('inquirer');
const axios = require('axios');
const Ubsub = require('./index');
const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const chalk = require('chalk');
const readline = require('readline');


const CONFIG_PATH = `${os.homedir()}/.ubsub`;
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH))
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return null;
}
function assertGetClient(args) {
  const opts = { reconnectOnError: args.reconnect };

  if (args.user && args.userkey)
    return Ubsub(args.user, args.userkey, opts);

  const cfg = loadConfig();
  if (!cfg) {
    console.error('No configuration found. Please run `ubsub login`');
    process.exit(1);
  }
  return Ubsub(cfg.userId, cfg.userKey, opts);
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
    const c = Ubsub(answers.userId, answers.userKey).getApi();
    return c.getTopics()
      .then(() => answers)
      .catch(err => {
        throw Error(`Unable to login user: ${chalk.red(err.message)}`);
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

function cmdInfo(args) {
  const config = loadConfig();
  const client = assertGetClient(args);
  const api = client.getApi();

  console.error(`${chalk.dim('UserId: ')}${args.user || config.userId}`);
  console.error(`${chalk.dim('Url:    ')}${api.routerUrl()}`);
}

function cmdListen(args) {
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
}

function cmdForward(args) {
  console.error(`${chalk.bold('Forwarding')}: ${chalk.red(args.topic)} -> ${chalk.green(args.url)}...`);
  return assertGetClient(args)
    .listen(args.topic, (event, { topicId }) => {
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
        console.error(chalk.red(err));
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
}

function cmdPipe(args) {
  const cb = assertGetClient(args).pipe(args.topic, args.key);
  const rl = readline.createInterface({
    input: process.stdin,
  });
  rl.on('line', line => {
    let data = null;
    try {
      data = JSON.parse(line);
    } catch (e) {
      data = {
        line,
      };
    }
    if (args.name)
      data.name = args.name;
    cb(data);
  });
  rl.on('close', () => {
    cb.sock.close();
  });
}

function cmdListTopics(args) {
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
}

function cmdListTemplates(args) {
  const api = assertGetClient(args).getApi();

  if (!args.command || args.command === 'list') {
    console.error('Templates:');
    return api.getTemplates()
      .then(templates => {
        _.each(templates, t => {
          console.error(`  [${chalk.dim(t.id)}] (${chalk.dim(t.language)}) ${chalk.red(t.name)}`);
        });
      });
  } else if (args.command === 'push') {
    console.error(`Pushing ${chalk.bold(args.file)} to ${chalk.bold(args.id || 'new template')}...`);
    return api.createOrUpdateTemplate({
      id: args.id,
      language: args.lang,
      name: args.name,
      source: fs.readFileSync(args.file, 'utf8'),
    }).then(template => {
      console.error(chalk.green('Push successful'));
      console.error(`${chalk.dim('Id:   ')}${chalk.blue(template.id)}`);
      console.error(`${chalk.dim('Name: ')}${template.name}`);
      console.error(`${chalk.dim('Lang: ')}${template.language}`);
      console.error(`${chalk.dim('Last: ')}${template.updatedAt}`);
    }).catch(err => {
      console.error(chalk.red(`Error: ${err.message}; ${err.response.data.message}`));
    });
  } else if (args.command === 'get') {
    if (!args.id) {
      console.error(`Need to specify template id with ${chalk.bold('--id')}`);
      return null;
    }
    return api.getTemplate(args.id)
      .then(template => {
        console.error(`${chalk.dim('Id:   ')}${chalk.blue(template.id)}`);
        console.error(`${chalk.dim('Name: ')}${template.name}`);
        console.error(`${chalk.dim('Lang: ')}${template.language}`);
        console.error(`${chalk.dim('Last: ')}${template.updatedAt}`);
        console.error('');
        console.log(template.source); // Specifically not error
      }).catch(err => {
        console.error(chalk.red(`Error: ${err.message}`));
      });
  }
  console.error(`Unknown command: ${args.command}`);
  return null;
}

function cmdTokens(args) {
  const api = assertGetClient(args).getApi();

  if (!args.command || args.command === 'list') {
    console.error('Tokens:');
    return api.getTokens()
      .then(tokens => {
        _.each(tokens, t => {
          console.error(`  [${chalk.dim(t.id)}] ${chalk.green(t.name)} ${!args.show ? chalk.dim('<Hidden>') : chalk.cyan(t.secret)}`);
        });
      }).catch(err => {
        console.error(chalk.red(`Error: ${err.message}`));
      });
  } else if (args.command === 'create') {
    return api.createToken(args.name)
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
  .command('info', 'Output info about current config', {}, cmdInfo)
  .command('listen <topic>', 'Listen to a topic and output to terminal', sub => {
    return sub
      .boolean('create')
      .describe('create', 'Create a new topic rather than listening to existing')
      .boolean('keep')
      .describe('keep', 'Keep a newly created topic rather than deleting when done')
      .boolean('keyless')
      .describe('keyless', 'Do not assign a key of creating a topic')
      .boolean('format')
      .describe('format', 'Format outputted JSON');
  }, cmdListen)
  .command('forward <topic> <url>', 'Forward an event from a topic to a url', sub => {
    return sub
      .boolean('reconnect')
      .describe('reconnect', 'Automatically reconnect socket upon disconnect-error')
      .string('method')
      .describe('method', 'HTTP method to push to url with')
      .default('method', 'POST');
  }, cmdForward)
  .command('webhook <url>', 'Creates a webhook URL that will forward an event to the provided URL', sub => {
    return sub
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
  }, cmdWebhook)
  .command('pipe <topic>', 'Pipe stdin to a given topic.  Will try to parse JSON, or encapsulate', sub => {
    return sub
      .string('key')
      .describe('key', 'Key for topic')
      .string('name')
      .describe('name', 'Name to associate with the application');
  }, cmdPipe)
  .command('topics', 'List registered topics on ubsub', {}, cmdListTopics)
  .command('templates [command] [file]', 'List registered templates on ubsub', sub => {
    return sub
      .positional('command', {
        describe: 'Command to execute against templates',
        type: 'string',
        default: 'list',
        choices: ['list', 'push', 'get'],
      })
      .positional('file', {
        describe: 'File to push to template',
        type: 'string',
      })
      .describe('id', 'Id of the template to operate on')
      .string('id')
      .describe('name', 'Name to assign to the template')
      .string('name')
      .describe('language', 'Language of the template')
      .alias('language', 'lang')
      .string('language');
  }, cmdListTemplates)
  .command('tokens [command]', 'List tokens on ubsub', sub => {
    return sub
      .positional('command', {
        describe: 'Command to execute for token',
        type: 'string',
        default: 'list',
        choices: ['list', 'create'],
      })
      .describe('name', 'Name to assign when creating a token')
      .string('name')
      .describe('show', 'Show secrets')
      .boolean('show');
  }, cmdTokens)
  .command('help <command>', 'Show help for a command', {}, () => args.showHelp())
  .example('$0 templates --help', 'See more help about templates')
  .example('$0 listen <topic> --create', 'Listen to a newly created topic')
  .example('tail -f /var/log/syslog | $0 pipe id', 'Pipe a tail\'d file to a topic')
  .example('$0 webhook http://localhost:8080', 'Create a public webhook that will push events to a local URL')
  .demandCommand()
  .recommendCommands()
  .help('help')
  .alias('help', 'h')
  .version()
  .env('UBSUB')
  .epilog(`Epilog:
    You can set login information via environmental variables,
    eg. UBSUB_USER, UBSUB_USERKEY

    Add --help after any command to see more detail`);

args.parse();
