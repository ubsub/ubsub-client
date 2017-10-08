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

    createTopic(name) {
      return executeRequest('POST', '/topic', {
        name,
      });
    },

    deleteTopic(id) {
      return executeRequest('DELETE', `/topic/${id}`);
    },
  };
};
