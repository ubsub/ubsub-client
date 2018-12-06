#!/usr/bin/env node
const io = require('socket.io-client');
const axios = require('axios');
const _ = require('lodash');
const Client = require('./lib/client');

module.exports = (userId, userKey, ubsubOpts) => {
  const opts = _.assign({
    socketHost: 'https://socket.ubsub.io',
    routerHost: 'https://router.ubsub.io',
    reconnectOnError: true,
    reconnectOnErrorDelay: 5000,
  }, ubsubOpts);

  return {
    listen(topicId, onEvent) {
      const sock = io(`${opts.socketHost}/socket?userId=${userId}&topicId=${topicId}&userKey=${userKey}`);
      sock.on('event', (event) => {
        onEvent(event.payload, _.omit(event, 'payload'));
      });
      sock.on('connect', () => {
        console.error(`Connected to ${topicId}`);
      });
      sock.on('handshake-error', err => {
        console.error(`Failed to listen to topic ${topicId}: ${err.err}`);
      });
      sock.on('reconnect', () => {
        console.error(`Reconnected topic ${topicId}`);
      });
      sock.on('disconnect', () => {
        console.error(`Disconnected topic ${topicId}`);
        if (opts.reconnectOnError) {
          console.error(`Attempting reconnect to ${topicId}...`);
          setTimeout(() => sock.connect(), opts.reconnectOnErrorDelay);
        }
      });
      return sock;
    },

    pipe(topicId, topicKey = null) {
      const sock = io(`${opts.socketHost}/socket?userId=${userId}&userKey=${userKey}`);
      function cb(payload) {
        sock.emit('event', {
          topicId,
          topicKey,
          payload,
        });
      }
      cb.sock = sock;
      return cb;
    },

    forward(topicId, forwardUrl, httpOpts) {
      return this.listen(topicId, event => {
        axios(_.merge({
          url: forwardUrl,
          data: event.payload,
          headers: {
            'X-Topic-Id': event.topicId,
          },
          method: 'post', // default, can be overriden in opts
        }, httpOpts)).catch(err => {
          console.error(`Error forwarding event from '${topicId} to URL ${forwardUrl}: ${err.message}`);
        });
      });
    },

    send(topicId, key, data, method = 'POST') {
      return axios({
        url: `${opts.routerHost}/event/${topicId}`,
        method,
        data,
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
    },

    getApi() {
      return Client(userId, userKey, opts);
    },
  };
};
