import type { APIRoute } from "astro";
import { CLES_JSON, BASE_ACHAT_URL, CLE_DEMO } from "astro:env/server";
import { handleMcp } from "../lib/mcp";

// Endpoint MCP servi à la demande (SSR). L'URL publique est `<origine>/mcp`,
// c'est celle à mettre dans TUTO_MCP_URL côté plugin.
export const prerender = false;

const env = { CLES_JSON, BASE_ACHAT_URL, CLE_DEMO };

export const POST: APIRoute = ({ request }) => handleMcp(request, env);
export const GET: APIRoute = ({ request }) => handleMcp(request, env);
export const OPTIONS: APIRoute = ({ request }) => handleMcp(request, env);
