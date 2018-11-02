#!/usr/bin/env node
const yargs = require('yargs');

const args = yargs
  .usage('$0 <cmd> [args]')
  .boolean('v')
  .alias('v', 'verbose')
  .describe('v', 'Verbose debug output')
  .string('user')
  .describe('user', 'User id to override one that you logged in to')
  .string('userkey')
  .describe('userkey', 'User key to override your logged in account')
  .command(require('./cmds/login'))
  .command(require('./cmds/logout'))
  .command(require('./cmds/info'))
  .command(require('./cmds/listen'))
  .command(require('./cmds/events'))
  .command(require('./cmds/forward'))
  .command(require('./cmds/webhook'))
  .command(require('./cmds/pipe'))
  .command(require('./cmds/topics'))
  .command(require('./cmds/templates'))
  .command(require('./cmds/tokens'))
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
