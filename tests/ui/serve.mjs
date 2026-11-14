// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const port = Number(process.argv[2] ?? 4173);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new RangeError('Pass a port from 1 to 65535, or 0 for an available port.');
}
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const requested = url === '/' ? '/tests/ui/preview.html' : url;
  let file = path.normalize(path.join(root, requested));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (!fs.existsSync(file) && requested.startsWith('/assets')) {
    file = path.normalize(path.join(root, 'public', requested));
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('missing');
      return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  });
});
server.listen(port, '127.0.0.1', () => {
  console.log(`preview http://127.0.0.1:${server.address().port}/tests/ui/preview.html`);
});
