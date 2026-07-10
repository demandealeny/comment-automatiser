// Serveur MCP « comment-automatiser » — transport Streamable HTTP (JSON-RPC 2.0),
// sans état (stateless). Expose le catalogue et le contenu des tutoriels comme
// des OUTILS MCP, avec contrôle d'accès gratuit/payant par clé de licence.
//
// Portable : n'utilise que les API Web standard (Request/Response). Tourne aussi
// bien sur Cloudflare Workers (`export default { fetch }`) que sur Node
// (voir dev-server.js) ou en test direct (voir test/smoke.mjs).

import { listerTutoriels, getTuto, getTutoMeta, getEtape, getRubrique } from "./content.js";
import { resoudreDroits, aAcces } from "./entitlements.js";

const SERVER_INFO = { name: "comment-automatiser", version: "0.3.0" };
const PROTOCOL_DEFAULT = "2025-06-18";

// ---------------------------------------------------------------------------
// Définition des outils exposés
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "lister_tutoriels",
    description:
      "Renvoie le catalogue des tutoriels disponibles (id, titre, niveau, accès " +
      "gratuit/payant, et si l'apprenant les a débloqués). À utiliser pour /start.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "obtenir_tuto",
    description:
      "Métadonnées d'un tutoriel pour le démarrer : titre, nombre d'étapes, accès, " +
      "et si l'apprenant l'a débloqué.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "id du tutoriel (ex. hello-mcp)" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "obtenir_etape",
    description:
      "Contenu (objectif + marche à suivre) de l'étape n d'un tutoriel. Si le tutoriel " +
      "est payant et non débloqué, renvoie un message de paywall avec le lien d'achat.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "id du tutoriel" },
        n: { type: "integer", minimum: 1, description: "numéro de l'étape" },
      },
      required: ["id", "n"],
      additionalProperties: false,
    },
  },
  {
    name: "obtenir_rubrique",
    description:
      "Critères de vérification PASS/FAIL de l'étape n (à passer au sous-agent " +
      "vérificateur). Gated comme le contenu pour les tutoriels payants.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "id du tutoriel" },
        n: { type: "integer", minimum: 1, description: "numéro de l'étape" },
      },
      required: ["id", "n"],
      additionalProperties: false,
    },
  },
  {
    name: "lien_achat",
    description: "Lien d'achat pour débloquer un tutoriel payant.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "id du tutoriel" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
];

// ---------------------------------------------------------------------------
// Logique des outils
// ---------------------------------------------------------------------------

function lienAchat(id, env) {
  const base = (env && env.BASE_ACHAT_URL) || "https://comment-automatiser.fr/achat";
  return `${base.replace(/\/+$/, "")}/${encodeURIComponent(id)}`;
}

function paywall(tuto, env) {
  return (
    `🔒 Le tutoriel « ${tuto.titre} » (${tuto.id}) est payant et n'est pas encore débloqué ` +
    `sur ta clé.\n\n` +
    `Pour y accéder : achète-le puis renseigne ta clé de licence (variable TUTO_CLE).\n` +
    `Lien d'achat : ${lienAchat(tuto.id, env)}`
  );
}

// Chaque handler renvoie soit une string (→ contenu texte), soit
// { text, isError } pour signaler une erreur applicative.
const HANDLERS = {
  lister_tutoriels(_args, ctx) {
    const cat = listerTutoriels().map((t) => ({
      ...t,
      debloque: aAcces(t, ctx.droits),
    }));
    return JSON.stringify({ tutoriels: cat }, null, 2);
  },

  obtenir_tuto(args, ctx) {
    const meta = getTutoMeta(args.id);
    if (!meta) return { text: `Tutoriel inconnu : ${args.id}`, isError: true };
    return JSON.stringify({ ...meta, debloque: aAcces(meta, ctx.droits) }, null, 2);
  },

  obtenir_etape(args, ctx) {
    const tuto = getTuto(args.id);
    if (!tuto) return { text: `Tutoriel inconnu : ${args.id}`, isError: true };
    if (!aAcces(tuto, ctx.droits)) return paywall(tuto, ctx.env);
    const etape = getEtape(args.id, args.n);
    if (etape == null) {
      return {
        text: `Étape ${args.n} introuvable (le tutoriel « ${args.id} » a ${tuto.nbEtapes} étapes).`,
        isError: true,
      };
    }
    return etape;
  },

  obtenir_rubrique(args, ctx) {
    const tuto = getTuto(args.id);
    if (!tuto) return { text: `Tutoriel inconnu : ${args.id}`, isError: true };
    if (!aAcces(tuto, ctx.droits)) return paywall(tuto, ctx.env);
    const rub = getRubrique(args.id, args.n);
    if (rub == null) {
      return { text: `Rubrique introuvable pour ${args.id} étape ${args.n}.`, isError: true };
    }
    return rub;
  },

  lien_achat(args, ctx) {
    if (!getTuto(args.id)) return { text: `Tutoriel inconnu : ${args.id}`, isError: true };
    return lienAchat(args.id, ctx.env);
  },
};

// ---------------------------------------------------------------------------
// JSON-RPC / MCP
// ---------------------------------------------------------------------------

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function rpcError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: "2.0", id, error };
}

function extraireCle(request) {
  const auth = request.headers.get("authorization");
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, "").trim();
  const x = request.headers.get("x-tuto-cle");
  return x ? x.trim() : null;
}

function callTool(name, args, ctx) {
  const handler = HANDLERS[name];
  if (!handler) {
    return { content: [{ type: "text", text: `Outil inconnu : ${name}` }], isError: true };
  }
  const out = handler(args || {}, ctx);
  if (out && typeof out === "object" && "text" in out) {
    return { content: [{ type: "text", text: out.text }], isError: Boolean(out.isError) };
  }
  return { content: [{ type: "text", text: String(out) }] };
}

// Traite un message JSON-RPC unique. Renvoie l'objet réponse, ou null pour une
// notification (pas de réponse).
function handleMessage(msg, ctx) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpcError(msg && msg.id != null ? msg.id : null, -32600, "Requête invalide");
  }
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case "initialize": {
      const asked = params && params.protocolVersion;
      return rpcResult(id, {
        protocolVersion: asked || PROTOCOL_DEFAULT,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    }
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const name = params && params.name;
      const args = params && params.arguments;
      return rpcResult(id, callTool(name, args, ctx));
    }
    case "ping":
      return rpcResult(id, {});
    default:
      if (method.startsWith("notifications/")) return null; // ex. notifications/initialized
      if (isNotification) return null;
      return rpcError(id, -32601, `Méthode non supportée : ${method}`);
  }
}

// ---------------------------------------------------------------------------
// Handler HTTP (Web standard)
// ---------------------------------------------------------------------------

const JSON_HEADERS = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization, x-tuto-cle, mcp-protocol-version",
  "access-control-allow-methods": "POST, GET, OPTIONS",
};

/**
 * @param {Request} request
 * @param {object} env  variables d'environnement (CLES_JSON, BASE_ACHAT_URL, …)
 * @returns {Promise<Response>}
 */
export async function handleMcp(request, env = {}) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }
  // Sonde de santé pratique (GET) — le transport MCP n'a pas besoin de SSE ici.
  if (request.method === "GET") {
    return new Response(
      JSON.stringify({ ok: true, server: SERVER_INFO, transport: "streamable-http" }),
      { status: 200, headers: JSON_HEADERS }
    );
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify(rpcError(null, -32600, "Méthode HTTP non supportée")), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify(rpcError(null, -32700, "JSON invalide")), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const cle = extraireCle(request);
  const ctx = { env, cle, droits: resoudreDroits(cle, env) };

  // Support d'un lot (array) ou d'un message unique.
  const messages = Array.isArray(payload) ? payload : [payload];
  const responses = messages.map((m) => handleMessage(m, ctx)).filter((r) => r !== null);

  // Que des notifications → 202 sans corps (conforme Streamable HTTP).
  if (responses.length === 0) {
    return new Response(null, { status: 202, headers: JSON_HEADERS });
  }

  const body = Array.isArray(payload) ? responses : responses[0];
  return new Response(JSON.stringify(body), { status: 200, headers: JSON_HEADERS });
}

export { TOOLS, SERVER_INFO };
