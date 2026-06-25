const http = require('http');
const { execSync } = require('child_process');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'POST only' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { action, params } = JSON.parse(body);
      if (!action) throw new Error('action manquante');

      const paramsArg = params
        ? `-p '${JSON.stringify(params)}'`
        : '';
      const cmd = `clasp run ${action} ${paramsArg}`.trim();

      console.log(`→ ${cmd}`);
      const output = execSync(cmd, { encoding: 'utf8', timeout: 30000 }).trim();

      let parsed;
      try {
        parsed = JSON.parse(output);
      } catch {
        parsed = output;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, result: parsed }));
    } catch (e) {
      console.error(`✗ ${e.message}`);
      if (!res.headersSent) res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Proxy GAS actif → http://localhost:${PORT}`);
  console.log('Usage : curl -X POST http://localhost:3000 \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"action":"ping"}\'');
});
