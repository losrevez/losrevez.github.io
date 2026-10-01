// Tiny static server for local preview, PDF export and tests. No dependencies.
// Usage: node scripts/serve.mjs [port]   (default 8080)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml',
  '.pdf': 'application/pdf',
};
const ROOT = process.cwd();

export function serve(port = 8080) {
  const server = http.createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(ROOT, path);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      let body = await readFile(file);
      const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
      const headers = { 'Content-Type': type, 'Cache-Control': 'no-cache' };
      // Gzip text types, like GitHub Pages does, so local Lighthouse numbers match production.
      if (/text|json|svg|xml|javascript/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
        body = gzipSync(body);
        headers['Content-Encoding'] = 'gzip';
        headers.Vary = 'Accept-Encoding';
      }
      res.writeHead(200, headers);
      res.end(body);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404');
    }
  });
  return new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, () => ok(server));
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // If the port is busy (e.g. another preview still running), try the next ones.
  let port = Number(process.argv[2]) || 8080;
  for (let tries = 0; ; tries++, port++) {
    try { await serve(port); break; } catch (e) {
      if (e.code !== 'EADDRINUSE' || tries >= 10) throw e;
      console.log(`Port ${port} is in use, trying ${port + 1}…`);
    }
  }
  console.log(`Preview: http://localhost:${port}/   (print version: /dist/print.html)   Stop with Ctrl+C`);
}
