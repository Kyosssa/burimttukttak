import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };

export function createPreviewServer() {
  return createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { pathname = '/404.html'; }
    const relative = normalize(pathname).replace(/^([/\\])+/, '');
    let target = join(root, relative);
    if (pathname !== '/' && !pathname.endsWith('/') && existsSync(target) && statSync(target).isDirectory()) {
      response.writeHead(301, { Location: `${pathname}/${new URL(request.url, 'http://localhost').search}` });
      return response.end();
    }
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    const found = existsSync(target) && statSync(target).isFile() && target.startsWith(root);
    if (!found) target = join(root, '404.html');
    response.writeHead(found ? 200 : 404, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream' });
    if (request.method === 'HEAD') return response.end();
    createReadStream(target).pipe(response);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || process.env.PORT || 4173);
  createPreviewServer().listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`));
}
