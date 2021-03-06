const os = require('os');
const fs = require('fs');
const chalk = require('chalk');
const _ = require('lodash');
const Ubsub = require('libubsub').streaming;

const CONFIG_PATH = `${os.homedir()}/.ubsub`;

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH))
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return null;
}

module.exports = {
  assertGetClient(args) {
    const opts = { reconnectOnError: args.reconnect };

    if (args.user && args.userkey)
      return Ubsub(args.user, args.userkey, opts);

    const cfg = loadConfig();
    if (!cfg) {
      console.error('No configuration found. Please run `ubsub login`');
      process.exit(1);
    }
    return Ubsub(cfg.userId, cfg.userKey, opts);
  },

  saveCredentials(userId, userKey) {
    console.error(`Saving configuration to: ${CONFIG_PATH}`);
    const creds = { userId, userKey };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(creds, null, '\t'));
  },

  deleteCredentials() {
    try {
      fs.unlinkSync(CONFIG_PATH);
      console.error('Config deleted');
    } catch (err) {
      console.error(`Error deleting config: ${err.message}`);
    }
  },

  catchError(err) {
    if (err instanceof Error) {
      if (err.response) {
        const subError = _.get(err, 'response.data.message', 'Unknown');
        console.error(chalk.red(`${err.message}: ${chalk.dim(subError)}`));
      } else
        console.error(chalk.red(err.message));
    } else
      console.error(chalk.red(err));

    process.exit(2);
  },
};
