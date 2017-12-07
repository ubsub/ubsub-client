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
  };
};
