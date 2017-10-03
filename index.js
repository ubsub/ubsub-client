#!/usr/bin/env node
const io = require('socket.io-client');
const axios = require('axios');
const _ = require('lodash');

module.exports = (userId, userKey, opts) => {
  const o = opts || {};
  const host = o.host || 'https://socket.ubsub.io';

  return {
    listen(topicId, onEvent) {
      const sock = io(`${host}/socket?userId=${userId}&topicId=${topicId}&userKey=${userKey}`);
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

  };
};
