/**
 * Host half of the WenKai font bundle.
 *
 * Serves the packaged LXGW WenKai (霞鹜文楷) web font and prepends its
 * stylesheet to the Harness index document, so the selected font is available
 * before the application paints. The stylesheet only declares `@font-face`
 * faces and puts the family ahead of the built-in text stack through
 * `--dsh-font-family-text`; it never replaces Harness stylesheets.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'wenkai-font';
export const inject = ['webServer'];

const ASSET_DIR = join(dirname(fileURLToPath(import.meta.url)), 'assets');
/** Route prefix claimed by this plugin; it does not overlap Harness routes. */
const ROUTE_PREFIX = '/dsh-wenkai';
const STYLESHEET_URL = `${ROUTE_PREFIX}/font.css`;
const FONT_URL_PREFIX = `${ROUTE_PREFIX}/fonts/`;
/** Exact packaged file names; anything else is a 404, so no path can escape APP_ASSET_DIR. */
const FONT_FILE = /^lxgwwenkai-regular-subset-\d{1,4}\.woff2$/;
const WOFF2_TYPE = 'font/woff2';

const readAsset = (path) => {
  try {
    return readFileSync(path);
  } catch {
    return undefined;
  }
};

const stylesheet = readAsset(join(ASSET_DIR, 'font.css'));
const fontCache = new Map();
/** Read one packaged subset once; the files are immutable for this package version. */
function fontBytes(fileName) {
  let bytes = fontCache.get(fileName);
  if (bytes === undefined) {
    bytes = readAsset(join(ASSET_DIR, 'fonts', fileName));
    if (bytes === undefined) return undefined;
    fontCache.set(fileName, bytes);
  }
  return bytes;
}

function answer(req, res, status, headers, body) {
  res.writeHead(status, headers);
  if (req.method === 'HEAD' || body === undefined) res.end();
  else res.end(body);
}

function notFound(req, res) {
  answer(req, res, 404, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
  }, 'Not found\n');
}

/** Serve the stylesheet and its packaged woff2 subsets under {@link ROUTE_PREFIX}. */
function handle(req, res) {
  const method = req.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    answer(req, res, 405, {
      allow: 'GET, HEAD',
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    }, 'Method not allowed\n');
    return;
  }
  let pathname;
  try {
    pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  } catch {
    answer(req, res, 400, {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    }, 'Bad request\n');
    return;
  }
  if (pathname === STYLESHEET_URL) {
    if (stylesheet === undefined) {
      notFound(req, res);
      return;
    }
    answer(req, res, 200, {
      'content-type': 'text/css; charset=utf-8',
      'content-length': String(stylesheet.byteLength),
      // The stylesheet body is fixed for this package version; keep a short
      // revalidation window so an updated bundle is picked up on reload.
      'cache-control': 'public, max-age=300',
    }, stylesheet);
    return;
  }
  if (pathname.startsWith(FONT_URL_PREFIX)) {
    let fileName;
    try {
      fileName = decodeURIComponent(pathname.slice(FONT_URL_PREFIX.length));
    } catch {
      notFound(req, res);
      return;
    }
    if (!FONT_FILE.test(fileName)) {
      notFound(req, res);
      return;
    }
    const bytes = fontBytes(fileName);
    if (bytes === undefined) {
      notFound(req, res);
      return;
    }
    answer(req, res, 200, {
      'content-type': WOFF2_TYPE,
      'content-length': String(bytes.byteLength),
      'cache-control': 'public, max-age=31536000, immutable',
    }, bytes);
    return;
  }
  notFound(req, res);
}

/**
 * Register the font route and contribute the stylesheet row to the Harness
 * index document. Both registrations are effects of this plugin fiber, so
 * unloading the plugin removes the route and the injected stylesheet.
 * @param ctx Host plugin context; `webServer` is present because of `inject`.
 */
export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: ROUTE_PREFIX,
    handler: handle,
  }));
  ctx.on('webserver/index-inject', (table) => {
    table.push({
      kind: 'html',
      placement: 'head',
      html: `<link rel="stylesheet" href="${STYLESHEET_URL}" data-wenkai-font>`,
    });
  });
}
