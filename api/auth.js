// api/auth.js - Vercel Serverless Function & Dev Route for Email Verification
const crypto = require('crypto');
const { sendVerificationEmail } = require('./ses.js');

const AUTH_SECRET = process.env.AWS_SECRET_ACCESS_KEY || process.env.GEMINI_API_KEY || 'peck-fitness-auth-salt';

function generateHmac(data) {
  return crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { action, email, code, token } = req.body || {};

  // 1. Action: send-code
  if (action === 'send-code') {
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    const payload = `${cleanEmail}:${otpCode}:${expiresAt}`;
    const signature = generateHmac(payload);
    const verificationToken = `${expiresAt}.${signature}`;

    try {
      const emailResult = await sendVerificationEmail(cleanEmail, otpCode);
      if (!emailResult.success) {
        console.error('Email send error:', emailResult.error);
        return res.status(502).json({
          error: 'Could not send verification email. Please check your address or try again.'
        });
      }

      return res.status(200).json({
        ok: true,
        message: `Verification code sent to ${cleanEmail}.`,
        email: cleanEmail,
        token: verificationToken
      });
    } catch (err) {
      console.error('Send code exception:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  // 2. Action: verify-code
  if (action === 'verify-code') {
    if (!email || !code || !token) {
      return res.status(400).json({ error: 'Missing email, code, or token.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = String(code).trim();
    const parts = token.split('.');
    if (parts.length !== 2) {
      return res.status(400).json({ error: 'Malformed verification token.' });
    }

    const [expiresAtStr, expectedSignature] = parts;
    const expiresAt = Number(expiresAtStr);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    const payload = `${cleanEmail}:${cleanCode}:${expiresAt}`;
    const calculatedSignature = generateHmac(payload);

    if (calculatedSignature !== expectedSignature) {
      return res.status(400).json({ error: 'Incorrect verification code. Please check your inbox and try again.' });
    }

    // Code is valid! Generate a persistent verified token
    const verifiedToken = generateHmac(`verified:${cleanEmail}`);

    return res.status(200).json({
      ok: true,
      verified: true,
      email: cleanEmail,
      verifiedToken
    });
  }

  return res.status(400).json({ error: 'Unknown action. Must be "send-code" or "verify-code".' });
};
