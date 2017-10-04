#!/usr/bin/env node
const io = require('socket.io-client');
const axios = require('axios');
const _ = require('lodash');
const Client = require('./lib/client');

module.exports = (userId, userKey, ubsubOpts) => {
  const opts = _.assign({
    socketHost: 'https://socket.ubsub.io',
    routerHost: 'https://router.ubsub.io',
  }, ubsubOpts);

  return {
    listen(topicId, onEvent) {
      const sock = io(`${opts.socketHost}/socket?userId=${userId}&topicId=${topicId}&userKey=${userKey}`);
      sock.on('event', onEvent);
      return sock;
    },

    forward(topicId, forwardUrl, httpOpts) {
      return this.listen(topicId, data => {
        axios(_.assign({
          url: forwardUrl,
          data,
          method: 'post', // default, can be overriden in opts
        }, httpOpts)).catch(err => {
          console.error(`Error forwarding event from '${topicId} to URL ${forwardUrl}: ${err.message}`);
        });
      });
    },

    getApi() {
      return Client(userId, userKey, opts);
    },
  };
};
