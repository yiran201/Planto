// Cross-origin isolation shim for static hosts that cannot set custom
// response headers (REQ-089) - GitHub Pages is the motivating case.
//
// This app's local database (@sqlite.org/sqlite-wasm, OPFS-backed, see
// src/state/db.js) only works on a cross-origin-isolated page, which
// normally requires the SERVER to send Cross-Origin-Opener-Policy /
// Cross-Origin-Embedder-Policy / Cross-Origin-Resource-Policy response
// headers (vite.config.js already does this for the dev/preview
// servers, and serve-dist.cjs does it for a downloaded release build -
// REQ-090 added the third header after discovering COEP:require-corp
// also blocks the nested OPFS async-proxy worker without it). GitHub
// Pages has no way to configure custom response headers at all, so a
// plain deploy there would load the page but fail to open the database.
//
// This service worker intercepts every fetch this page makes and
// re-emits each response with those two headers added, which achieves
// the same `window.crossOriginIsolated === true` result purely
// client-side - the technique this project is based on is documented
// at https://github.com/gzuidhof/coi-serviceworker. Registered by the
// inline script in index.html, and only on hosts that are not already
// isolated - it is a complete no-op wherever the server already sends
// the real headers (dev, preview, serve-dist.cjs).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  // Chrome throws for `{cache: 'only-if-cached'}` combined with a
  // cross-origin request - skip those rather than letting fetch() throw
  // and break navigation.
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      // Opaque (cross-origin, no-cors) responses can't be inspected or
      // safely relabeled from here - a real fix for those needs the
      // resource's own server to send Cross-Origin-Resource-Policy.
      // Passing them through unchanged is the same fallback the
      // reference implementation uses.
      if (response.status === 0) {
        return response;
      }
      const headers = new Headers(response.headers);
      headers.set('Cross-Origin-Opener-Policy', 'same-origin');
      headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
      headers.set('Cross-Origin-Resource-Policy', 'same-origin');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    })
  );
});
