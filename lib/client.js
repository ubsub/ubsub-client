const axios = require('axios');
const _ = require('lodash');

module.exports = (userId, userKey, opts) => {
  function executeRequest(method, path, data, params) {
    return axios({
      url: `${opts.routerHost}/api/v1/user/${userId}${path}`,
      method,
      data,
      params,
      headers: {
        Authorization: `Bearer ${userKey}`,
      },
    }).then(payload => payload.data)
      .catch(err => {
        const restMessage = _.get(err, 'response.data.message', 'Unknown');
        throw new Error(`${err.message}: ${restMessage}`);
      });
  }

  return {
    routerUrl() {
      return opts.routerHost;
    },

    tokenId() {
      return userId;
    },

    getUser() {
      return executeRequest('GET', '');
    },

    getTopicById(id) {
      return executeRequest('GET', `/topic/${id}`);
    },

    getTopics() {
      return executeRequest('GET', '/topic');
    },

    getTemplates() {
      return executeRequest('GET', '/template');
    },

    createTopic(name, key = true) {
      return executeRequest('POST', '/topic', {
        name,
        key,
      });
    },

    deleteTopic(id) {
      return executeRequest('DELETE', `/topic/${id}`);
    },

    getTemplate(id) {
      if (!id)
        return Promise.reject(Error('No such template'));
      return executeRequest('GET', `/template/${id}`);
    },

    createTemplate(name, language, source) {
      return executeRequest('POST', '/template', {
        name,
        language,
        source,
      });
    },

    updateTemplate(id, { name, language, source }) {
      if (!id)
        return Promise.reject(Error('No such template'));
      return executeRequest('PATCH', `/template/${id}`, {
        name,
        language,
        source,
      });
    },

    /* eslint object-curly-newline: off */
    createOrUpdateTemplate({ id, name, language, source }) {
      return this.updateTemplate(id, { name, language, source })
        .catch(() => this.createTemplate(name, language, source));
    },

    getTokens() {
      return executeRequest('GET', '/token');
    },

    createToken(name, scope) {
      return executeRequest('POST', '/token', { name, scope });
    },

    getEvents(searchOpts) {
      return executeRequest('GET', '/events', null, searchOpts);
    },
  };
};
