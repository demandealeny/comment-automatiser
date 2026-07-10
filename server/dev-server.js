// Serveur de développement local (Node) — enveloppe handleMcp dans un serveur HTTP.
// Usage : node dev-server.js  (port 8787 par défaut, override via PORT)
//
// Test rapide :
//   curl -s localhost:8787/mcp -H 'content-type: application/json' \
//     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq
//
// Contenu payant : ajouter -H 'x-tuto-cle: cle-demo-tuto' (clé démo intégrée).

import { createServer } from "node:http";
import { handleMcp } from "./src/mcp.js";

const PORT = Number(process.env.PORT || 8787);

// Convertit une requête Node en Request Web, appelle handleMcp, réécrit la Response.
function toWebRequest(req, body) {
  const url = `http://${req.headers.host || "localhost"}${req.url}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v != null) headers.set(k, v);
  }
  const init = { method: req.method, headers };
  if (body && body.length) init.body = body;
  return new Request(url, init);
}

const server = createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", async () => {
    try {
      const body = Buffer.concat(chunks);
      const webReq = toWebRequest(req, body);
      const webRes = await handleMcp(webReq, process.env);
      res.statusCode = webRes.status;
      webRes.headers.forEach((v, k) => res.setHeader(k, v));
      const text = await webRes.text();
      res.end(text);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: String(err && err.message ? err.message : err) }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`MCP « comment-automatiser » en écoute sur http://localhost:${PORT}/mcp`);
});
