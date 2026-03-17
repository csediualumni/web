import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  // Allow hosts configured via NG_ALLOWED_HOSTS env var, plus localhost for development
  const extraHosts = (process.env['NG_ALLOWED_HOSTS'] ?? '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  const allowedHosts = ['localhost', '127.0.0.1', ...extraHosts];

  const commonEngine = new CommonEngine({ allowedHosts });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve content-hashed JS/CSS bundles with long-lived cache
  server.get('**/*.js', express.static(browserDistFolder, { maxAge: '1y', immutable: true, redirect: false }));
  server.get('**/*.css', express.static(browserDistFolder, { maxAge: '1y', immutable: true, redirect: false }));

  // Serve fonts with long-lived cache
  server.get('**/*.{woff,woff2,ttf,eot}', express.static(browserDistFolder, { maxAge: '1y', redirect: false }));

  // Serve images without aggressive caching so deploys are reflected immediately
  server.get('**/*.{png,jpg,jpeg,gif,ico,svg,webp}', express.static(browserDistFolder, {
    setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
    redirect: false,
  }));

  // Serve all other static files (no index.html fallback — handled by SSR below)
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1d',
    index: false,
    redirect: false,
  }));

  // All regular routes use the Angular SSR engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
