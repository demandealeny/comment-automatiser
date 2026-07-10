// Point d'entrée Cloudflare Workers.
// La logique vit dans mcp.js (API Web standard) → aucune adaptation nécessaire.
//
// Déploiement : `npm run build:content && npx wrangler deploy`
// L'URL déployée (…workers.dev/ ou domaine custom) est celle à mettre dans la
// config MCP du plugin (variable TUTO_MCP_URL).

import { handleMcp } from "./mcp.js";

export default {
  fetch(request, env, _ctx) {
    return handleMcp(request, env);
  },
};
