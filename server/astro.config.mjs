import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";

// Serveur MCP + (future) landing page.
// - output 'static' par défaut ; seul l'endpoint /mcp est rendu à la demande (prerender=false).
// - Adaptateur Node (mode standalone) : `astro build` puis `node ./dist/server/entry.mjs`.
//   Se déploie partout (Render, Fly, Docker, VPS). Les env/secrets viennent de process.env.
//
//   Alternative Cloudflare Workers (build vérifié) : `npm i @astrojs/cloudflare wrangler` puis
//   `import cloudflare from '@astrojs/cloudflare'` + `adapter: cloudflare()`, et `wrangler deploy`.
//   NB : `astro dev` sous l'adaptateur Cloudflare (workerd) plante sur le logger JSON
//   (« process is not defined ») dans certains environnements — d'où l'adaptateur Node par défaut.
export default defineConfig({
  adapter: node({ mode: "standalone" }),
  env: {
    schema: {
      // Table clé -> droits (secret). Ex. {"cle-pack-pro":["*"]}
      CLES_JSON: envField.string({ context: "server", access: "secret", optional: true }),
      // Base des liens d'achat (l'id du tuto est ajouté à la fin).
      BASE_ACHAT_URL: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "https://comment-automatiser.fr/achat",
      }),
      // Mettre "off" en production pour désactiver la clé démo intégrée.
      CLE_DEMO: envField.string({ context: "server", access: "public", optional: true }),
    },
  },
});
