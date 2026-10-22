'use strict';
// Replicates the live Express fallback:  app.get('*', (req, res) => res.redirect('/#' + req.url))
// The original path arrives as __p (set by vercel.json); the remaining raw query string is re-attached after it.
module.exports = (req, res) => {
  const i = req.url.indexOf('?');
  const raw = i >= 0 ? req.url.slice(i + 1) : '';
  let p = '';
  const rest = [];
  for (const part of raw.split('&')) {
    if (part.startsWith('__p=')) p = decodeURIComponent(part.slice(4).replace(/\+/g, ' '));
    else if (part !== '') rest.push(part);
  }
  const target = '/#/' + p + (rest.length ? '?' + rest.join('&') : (req.url.endsWith('?') ? '?' : ''));
  res.statusCode = 302;
  res.setHeader('Location', target);
  res.setHeader('Vary', 'Accept');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Found. Redirecting to ' + target);
};
