// api/auth/send-code.js - Vercel Serverless Function
const authHandler = require('../auth.js');

module.exports = async function handler(req, res) {
  if (req.body && typeof req.body === 'object') {
    req.body.action = 'send-code';
  } else {
    req.body = { action: 'send-code' };
  }
  return authHandler(req, res);
};
