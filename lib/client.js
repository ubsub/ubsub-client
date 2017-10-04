const axios = require('axios');

module.exports = (userId, userKey, opts) => {
  function executeRequest(method, path) {
    return axios({
      url: `${opts.routerHost}/api/v1/user/${userId}${path}`,
      method,
      headers: {
        Authorization: `Bearer ${userKey}`,
      },
    }).then(payload => payload.data);
  }

  return {
    getTopics() {
      return executeRequest('GET', '/topic');
    },
  };
};
