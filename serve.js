const { spawn } = require('child_process');
const { createServer } = require('http');
const { createReadStream } = require('fs');
const { join, extname } = require('path');
const { parse } = require('url');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Default port
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer((req, res) => {
  // Parse URL
  const parsedUrl = parse(req.url);
  
  // Extract path from URL
  let pathname = parsedUrl.pathname;
  
  // Default to index.html if path is '/'
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Determine file path
  const filePath = join(process.cwd(), pathname);
  
  // Get file extension
  const ext = extname(filePath);
  
  // Set content type based on file extension
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // Read file and serve
  createReadStream(filePath)
    .on('error', () => {
      // If file not found, serve index.html (for SPA routing)
      if (ext === '.html' || ext === '') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        createReadStream(join(process.cwd(), 'index.html')).pipe(res);
      } else {
        // Return 404 for other file types
        res.writeHead(404);
        res.end('File not found');
      }
    })
    .on('open', () => {
      res.writeHead(200, { 'Content-Type': contentType });
    })
    .pipe(res);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// Start the build process in watch mode
const buildProcess = spawn('node', ['build.js', '--watch'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle build process exit
buildProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Build process exited with code ${code}`);
  }
  process.exit(code);
});

// Handle server process exit
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  buildProcess.kill();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});