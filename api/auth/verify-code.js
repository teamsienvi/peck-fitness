// api/auth/verify-code.js - Vercel Serverless Function
const authHandler = require('../auth.js');

module.exports = async function handler(req, res) {
  if (req.body && typeof req.body === 'object') {
    req.body.action = 'verify-code';
  } else {
    req.body = { action: 'verify-code' };
  }
  return authHandler(req, res);
};
