const chalk = require('chalk');
const _ = require('lodash');
const fs = require('fs');
const { assertGetClient } = require('./authUtil');

exports.command = 'templates [command] [file]';
exports.desc = 'List registered templates on ubsub';

exports.builder = sub => sub
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

exports.handler = function cmdListTemplates(args) {
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
};

