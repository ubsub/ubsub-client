#!/usr/bin/env node
const io = require('socket.io-client');
const axios = require('axios');
const _ = require('lodash');

function UbSubClient(userId, userKey, opts) {
  const o = opts || {};

  this._host = o.host || 'https://socket.ubsub.io';
  this._userId = userId;
  this._userSecret = userKey;

  this._sockets = {};
}

UbSubClient.prototype.listen = function listen(topicId, onEvent) {
  const sock = io(`${this._host}/socket?userId=${this._userId}&topicId=${topicId}&userKey=${this._userKey}`);
  sock.on('event', onEvent);
};

UbSubClient.prototype.forward = function forward(topicId, forwardUrl, opts) {
  this.listen(topicId, data => {
    axios(_.assign({
      url: forwardUrl,
      data,
      method: 'post', // default, can be overriden in opts
    }, opts));
  });
};


module.exports = new UbSubClient();
module.exports.Client = UbSubClient;
