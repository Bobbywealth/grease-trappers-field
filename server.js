import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist');
const port = process.env.PORT || 10000;

const app = express();

// Cache static assets aggressively
app.use('/assets', express.static(path.join(distPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
}));

// Serve every other static file in dist/ (logo.png, favicon, etc.) BEFORE SPA fallback
app.use(express.static(distPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.svg') || filePath.endsWith('.ico')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  },
}));

// Health
app.get('/healthz', (_req, res) => res.send('ok'));

// SPA fallback — serve index.html for any non-asset route (must be LAST)
app.get(/^(?!\/assets|\/healthz).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Grease Trappers field listening on :${port}`);
});