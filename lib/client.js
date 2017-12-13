const axios = require('axios');

module.exports = (userId, userKey, opts) => {
  function executeRequest(method, path, data) {
    return axios({
      url: `${opts.routerHost}/api/v1/user/${userId}${path}`,
      method,
      data,
      headers: {
        Authorization: `Bearer ${userKey}`,
      },
    }).then(payload => payload.data);
  }

  return {
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
  };
};
