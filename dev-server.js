// dev-server.js - Zero-dependency local dev server for PECK Fitness
// Serves static files and routes /api/chat and /api/auth endpoints.

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        process.env[k] = v;
      }
    }
  });
}

const chatHandler = require('./api/chat.js');
const authHandler = require('./api/auth.js');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // API Routes
  if (pathname === '/api/chat' || pathname.startsWith('/api/auth')) {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch {
        req.body = {};
      }

      // Adapter for Express/Vercel res.status().json()
      res.status = (code) => {
        res.statusCode = code;
        return {
          json: (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          }
        };
      };

      if (pathname === '/api/chat') {
        chatHandler(req, res);
      } else {
        if (pathname === '/api/auth/send-code') req.body.action = 'send-code';
        if (pathname === '/api/auth/verify-code') req.body.action = 'verify-code';
        authHandler(req, res);
      }
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (pathname === '/assistant' || pathname === '/assistant/') {
    filePath = path.join(__dirname, 'assistant.html');
  } else if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error loading file');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

let currentPort = Number(PORT);

function listen(port) {
  server.listen(port, () => {
    console.log(`\nPECK Fitness running:`);
    console.log(`  Landing page:       http://localhost:${port}/`);
    console.log(`  AI Assistant page:  http://localhost:${port}/assistant\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    currentPort += 1;
    console.warn(`Port in use. Trying port ${currentPort}...`);
    setTimeout(() => listen(currentPort), 250);
  } else {
    console.error('Server error:', err);
  }
});

listen(currentPort);
