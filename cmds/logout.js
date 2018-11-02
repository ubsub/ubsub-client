const authUtil = require('./authUtil');

exports.command = 'logout';
exports.desc = 'Logout (delete config)';

exports.handler = function cmdLogout() {
  authUtil.deleteCredentials();
};
