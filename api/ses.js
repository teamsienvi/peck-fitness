// api/ses.js - AWS SES Email Dispatcher using AWS Signature v4
const crypto = require('crypto');
const https = require('https');

function hmac(key, string) {
  return crypto.createHmac('sha256', key).update(string, 'utf8').digest();
}

function hash(string) {
  return crypto.createHash('sha256').update(string, 'utf8').digest('hex');
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, 'aws4_request');
}

/**
 * Sends a verification email
 * @param {string} toEmail - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendVerificationEmail(toEmail, code) {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';
  const fromEmail = process.env.SES_FROM_EMAIL || 'hello@peckfitness.ai';

  if (!accessKey || !secretKey) {
    throw new Error('AWS credentials are not configured in environment variables.');
  }

  const host = `email.${region}.amazonaws.com`;
  const service = 'ses';

  const subject = `Your PECK Fitness Verification Code: ${code}`;
  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PECK Fitness Verification</title>
</head>
<body style="margin:0;padding:24px;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;background-color:#1c221d;color:#f7f8f4;">
  <div style="max-width:480px;margin:0 auto;background-color:#2e3a2f;padding:32px;border:1px solid #455246;border-radius:4px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#dce4c9;font-size:22px;letter-spacing:1px;margin:0 0 6px;">PECK FITNESS</h1>
      <p style="color:#b6bd9f;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0;">Purpose-Built Mobility & Strength</p>
    </div>
    <div style="background-color:#1c221d;border:1px solid #3d4a3e;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="color:#e4e8dc;font-size:14px;margin:0 0 16px;">Here is your verification code to unlock unlimited chat access and product updates:</p>
      <div style="font-size:36px;font-weight:800;letter-spacing:6px;color:#dce4c9;background-color:#2e3a2f;padding:12px 20px;display:inline-block;border-radius:4px;border:1px dashed #8a8551;">
        ${code}
      </div>
      <p style="color:#8a8551;font-size:12px;margin:16px 0 0;">This code will expire in 15 minutes.</p>
    </div>
    <p style="color:#b6bd9f;font-size:13px;line-height:1.5;margin:0 0 12px;">If you didn't request this code on peckfitness, you can safely ignore this email.</p>
    <div style="border-top:1px solid #455246;padding-top:16px;text-align:center;">
      <p style="color:#7d8572;font-size:11px;margin:0;">&copy; 2026 PECK Fitness. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `PECK FITNESS - VERIFICATION CODE\n\nYour 6-digit verification code is: ${code}\n\nThis code expires in 15 minutes.\nUse this code on peckfitness to unlock unlimited assistant questions and early access.\n\n© 2026 PECK Fitness`;

  const params = new URLSearchParams();
  params.append('Action', 'SendEmail');
  params.append('Version', '2010-12-01');
  params.append('Source', `PECK Fitness <${fromEmail}>`);
  params.append('Destination.ToAddresses.member.1', toEmail);
  params.append('Message.Subject.Data', subject);
  params.append('Message.Subject.Charset', 'UTF-8');
  params.append('Message.Body.Html.Data', htmlBody);
  params.append('Message.Body.Html.Charset', 'UTF-8');
  params.append('Message.Body.Text.Data', textBody);
  params.append('Message.Body.Text.Charset', 'UTF-8');

  const body = params.toString();
  const now = new Date();
  const amzdate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzdate.slice(0, 8);

  const canonicalHeaders = `content-type:application/x-www-form-urlencoded\nhost:${host}\nx-amz-date:${amzdate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';
  const payloadHash = hash(body);

  const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzdate}\n${credentialScope}\n${hash(canonicalRequest)}`;

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');
  const authHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: host,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': host,
        'x-amz-date': amzdate,
        'Authorization': authHeader,
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const match = data.match(/<MessageId>(.*?)<\/MessageId>/);
          resolve({ success: true, messageId: match ? match[1] : undefined });
        } else {
          const codeMatch = data.match(/<Code>(.*?)<\/Code>/);
          const msgMatch = data.match(/<Message>(.*?)<\/Message>/);
          const errCode = codeMatch ? codeMatch[1] : `HTTP ${res.statusCode}`;
          const errMsg = msgMatch ? msgMatch[1] : data;
          resolve({ success: false, error: `${errCode}: ${errMsg}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Verification email service request timed out.' });
    });

    req.write(body);
    req.end();
  });
}

module.exports = { sendVerificationEmail };
