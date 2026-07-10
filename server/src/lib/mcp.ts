// Cœur MCP « comment-automatiser » — transport Streamable HTTP (JSON-RPC 2.0), stateless.
// Repris du serveur v1 (testé) ; les handlers d'outils sont désormais async car le
// contenu vient des Content Collections. N'utilise que des API Web (Request/Response),
// donc se branche tel quel dans un endpoint Astro.

import { listerTutoriels, getTutoMeta, getEtape, getRubrique, tutoExiste } from "./content";
import { resoudreDroits, aAcces, type Droits, type Env } from "./entitlements";
import type { TutoMeta } from "./content";

const SERVER_INFO = { name: "comment-automatiser", version: "0.3.0" };
const PROTOCOL_DEFAULT = "2025-06-18";

type Ctx = { env: Env; cle: string | null; droits: Droits };
type ToolOut = string | { text: string; isError?: boolean };

// ---------------------------------------------------------------------------
// Outils exposés
// ---------------------------------------------------------------------------

const idProp = { id: { type: "string", description: "id du tutoriel (ex. hello-mcp)" } };
const idNProps = {
  id: { type: "string", description: "id du tutoriel" },
  n: { type: "integer", minimum: 1, description: "numéro de l'étape" },
};

const TOOLS = [
  {
    name: "lister_tutoriels",
    description:
      "Renvoie le catalogue des tutoriels (id, titre, niveau, accès gratuit/payant, débloqué). Pour /start.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "obtenir_tuto",
    description: "Métadonnées d'un tutoriel pour le démarrer : titre, nombre d'étapes, accès, débloqué.",
    inputSchema: { type: "object", properties: idProp, required: ["id"], additionalProperties: false },
  },
  {
    name: "obtenir_etape",
    description:
      "Contenu de l'étape n. Si le tutoriel est payant et non débloqué, renvoie un paywall + lien d'achat.",
    inputSchema: { type: "object", properties: idNProps, required: ["id", "n"], additionalProperties: false },
  },
  {
    name: "obtenir_rubrique",
    description: "Critères PASS/FAIL de l'étape n (pour le vérificateur). Gated comme le contenu.",
    inputSchema: { type: "object", properties: idNProps, required: ["id", "n"], additionalProperties: false },
  },
  {
    name: "lien_achat",
    description: "Lien d'achat pour débloquer un tutoriel payant.",
    inputSchema: { type: "object", properties: idProp, required: ["id"], additionalProperties: false },
  },
];

// ---------------------------------------------------------------------------
// Logique des outils
// ---------------------------------------------------------------------------

function lienAchat(id: string, env: Env): string {
  const base = env?.BASE_ACHAT_URL || "https://comment-automatiser.fr/achat";
  return `${base.replace(/\/+$/, "")}/${encodeURIComponent(id)}`;
}

function paywall(tuto: TutoMeta, env: Env): string {
  return (
    `🔒 Le tutoriel « ${tuto.titre} » (${tuto.id}) est payant et n'est pas encore débloqué sur ta clé.\n\n` +
    `Pour y accéder : achète-le puis renseigne ta clé de licence (variable TUTO_CLE).\n` +
    `Lien d'achat : ${lienAchat(tuto.id, env)}`
  );
}

const HANDLERS: Record<string, (args: any, ctx: Ctx) => Promise<ToolOut>> = {
  async lister_tutoriels(_args, ctx) {
    const cat = (await listerTutoriels()).map((t) => ({ ...t, debloque: aAcces(t, ctx.droits) }));
    return JSON.stringify({ tutoriels: cat }, null, 2);
  },

  async obtenir_tuto(args, ctx) {
    const meta = await getTutoMeta(args.id);
    if (!meta) return { text: `Tutoriel inconnu : ${args.id}`, isError: true };
    return JSON.stringify({ ...meta, debloque: aAcces(meta, ctx.droits) }, null, 2);
  },

  async obtenir_etape(args, ctx) {
    const meta = await getTutoMeta(args.id);
    if (!meta) return { text: `Tutoriel inconnu : ${args.id}`, isError: true };
    if (!aAcces(meta, ctx.droits)) return paywall(meta, ctx.env);
    const etape = await getEtape(args.id, args.n);
    if (etape == null) {
      return { text: `Étape ${args.n} introuvable (le tutoriel « ${args.id} » a ${meta.nbEtapes} étapes).`, isError: true };
    }
    return etape;
  },

  async obtenir_rubrique(args, ctx) {
    const meta = await getTutoMeta(args.id);
    if (!meta) return { text: `Tutoriel inconnu : ${args.id}`, isError: true };
    if (!aAcces(meta, ctx.droits)) return paywall(meta, ctx.env);
    const rub = await getRubrique(args.id, args.n);
    if (rub == null) return { text: `Rubrique introuvable pour ${args.id} étape ${args.n}.`, isError: true };
    return rub;
  },

  async lien_achat(args, ctx) {
    if (!(await tutoExiste(args.id))) return { text: `Tutoriel inconnu : ${args.id}`, isError: true };
    return lienAchat(args.id, ctx.env);
  },
};

// ---------------------------------------------------------------------------
// JSON-RPC / MCP
// ---------------------------------------------------------------------------

function rpcResult(id: any, result: any) {
  return { jsonrpc: "2.0", id, result };
}
function rpcError(id: any, code: number, message: string, data?: any) {
  const error: any = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: "2.0", id, error };
}

function extraireCle(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, "").trim();
  const x = request.headers.get("x-tuto-cle");
  return x ? x.trim() : null;
}

async function callTool(name: string, args: any, ctx: Ctx) {
  const handler = HANDLERS[name];
  if (!handler) return { content: [{ type: "text", text: `Outil inconnu : ${name}` }], isError: true };
  const out = await handler(args || {}, ctx);
  if (out && typeof out === "object" && "text" in out) {
    return { content: [{ type: "text", text: out.text }], isError: Boolean(out.isError) };
  }
  return { content: [{ type: "text", text: String(out) }] };
}

async function handleMessage(msg: any, ctx: Ctx) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpcError(msg && msg.id != null ? msg.id : null, -32600, "Requête invalide");
  }
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: (params && params.protocolVersion) || PROTOCOL_DEFAULT,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call":
      return rpcResult(id, await callTool(params && params.name, params && params.arguments, ctx));
    case "ping":
      return rpcResult(id, {});
    default:
      if (method.startsWith("notifications/")) return null;
      if (isNotification) return null;
      return rpcError(id, -32601, `Méthode non supportée : ${method}`);
  }
}

// ---------------------------------------------------------------------------
// Handler HTTP (Web standard) — utilisé par l'endpoint Astro
// ---------------------------------------------------------------------------

const JSON_HEADERS = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization, x-tuto-cle, mcp-protocol-version",
  "access-control-allow-methods": "POST, GET, OPTIONS",
};

export async function handleMcp(request: Request, env: Env = {}): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });

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

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify(rpcError(null, -32700, "JSON invalide")), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const cle = extraireCle(request);
  const ctx: Ctx = { env, cle, droits: resoudreDroits(cle, env) };

  const messages = Array.isArray(payload) ? payload : [payload];
  const settled = await Promise.all(messages.map((m) => handleMessage(m, ctx)));
  const responses = settled.filter((r) => r !== null);

  if (responses.length === 0) return new Response(null, { status: 202, headers: JSON_HEADERS });

  const body = Array.isArray(payload) ? responses : responses[0];
  return new Response(JSON.stringify(body), { status: 200, headers: JSON_HEADERS });
}

export { TOOLS, SERVER_INFO };
