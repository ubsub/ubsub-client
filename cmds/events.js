const chalk = require('chalk');
const _ = require('lodash');
const { assertGetClient, catchError } = require('./authUtil');

exports.command = 'events [topic]';
exports.desc = 'Fetch saved events from a topic';

exports.builder = sub => sub
  .string('after')
  .describe('after', 'Look at events only after a specific date')
  .string('before')
  .describe('before', 'Look at events only before the specific date')
  .boolean('decorate')
  .describe('decorate', 'Output tab-separated values about event before payload')
  .string('csv')
  .describe('csv', 'Outpost CSV with the provided headers eg. a,b,c')
  .boolean('format')
  .describe('format', 'Format the JSON before outputting it')
  .number('page')
  .describe('page', 'Number of events to get with each page')
  .default('page', 100)
  .choices('direction', ['ASC', 'DESC'])
  .describe('direction', 'The direction to sort the ordered variable in')
  .default('direction', 'ASC')
  .string('order')
  .describe('order', 'Which variable to order by')
  .string('search')
  .describe('search', 'String to fuzzy-search the payload for');

exports.handler = function cmdEvents(args) {
  const client = assertGetClient(args);
  const api = client.getApi();
  const cols = args.csv ? args.csv.split(',') : null;

  function resolveTopic() {
    if (!args.topic)
      return Promise.resolve(args.topic);
    return api.getTopicByIdOrName(args.topic)
      .then(topic => topic.id);
  }

  return resolveTopic()
    .then(topicId => {
      function getPage(offset) {
        if (args.v)
          console.error(chalk.dim(`Fetching page with offset ${offset}...`));

        return api.getEvents({
          offset,
          limit: args.page || 500,
          topic_id: topicId,
          after: args.after,
          before: args.before,
          search: args.search,
          order: args.order,
          direction: args.direction,
        }).then(events => {
          _.each(events, event => {
            if (args.format) {
              // Formatting JSON doesn't support other flags
              console.dir(JSON.parse(event.payload), { depth: null, colors: true });
            } else {
              if (args.decorate)
                process.stdout.write(`${event.id}\t${event.topic_id}\t${event.createdAt}\t${event.delivery_count}\t`);

              if (cols) {
                const parsedEvent = JSON.parse(event.payload);
                process.stdout.write(_.map(cols, c => _.get(parsedEvent, c)).join(','));
              } else
                process.stdout.write(event.payload);

              process.stdout.write('\n');
            }
          });

          if (events.length !== 0)
            return getPage(offset + events.length);
          return null;
        });
      }

      return getPage(0);
    }).catch(catchError);
};
