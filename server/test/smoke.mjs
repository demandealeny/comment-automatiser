// Test de fumée du serveur MCP — appelle handleMcp() directement (aucun réseau).
// Usage : node test/smoke.mjs
//
// Vérifie : initialize, tools/list, contenu gratuit ouvert, paywall sur payant
// sans clé, déblocage avec la clé démo, et le lien d'achat.

import { handleMcp } from "../src/mcp.js";

let pass = 0;
let fail = 0;

function ok(cond, label) {
  if (cond) {
    pass++;
    console.log(`  ✅ ${label}`);
  } else {
    fail++;
    console.log(`  ❌ ${label}`);
  }
}

// Construit une requête MCP et renvoie le résultat JSON-RPC (result/error).
async function rpc(body, { cle, env } = {}) {
  const headers = { "content-type": "application/json" };
  if (cle) headers["x-tuto-cle"] = cle;
  const req = new Request("http://localhost/mcp", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const res = await handleMcp(req, env || {});
  if (res.status === 202) return { _notification: true };
  return res.json();
}

// Appelle un outil et renvoie le texte du premier contenu (+ isError).
async function callTool(name, args, opts) {
  const out = await rpc(
    { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } },
    opts
  );
  const result = out.result || {};
  const text = result.content && result.content[0] ? result.content[0].text : "";
  return { text, isError: Boolean(result.isError) };
}

console.log("1. initialize");
{
  const out = await rpc({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } },
  });
  ok(out.result && out.result.serverInfo.name === "comment-automatiser", "serverInfo renvoyé");
  ok(out.result && out.result.capabilities.tools, "capacité tools annoncée");
  ok(out.result && out.result.protocolVersion === "2025-06-18", "protocolVersion échoée");
}

console.log("2. notifications/initialized → 202 sans corps");
{
  const out = await rpc({ jsonrpc: "2.0", method: "notifications/initialized" });
  ok(out._notification === true, "notification acceptée sans réponse");
}

console.log("3. tools/list");
{
  const out = await rpc({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  const names = (out.result.tools || []).map((t) => t.name).sort();
  ok(
    JSON.stringify(names) ===
      JSON.stringify([
        "lien_achat",
        "lister_tutoriels",
        "obtenir_etape",
        "obtenir_rubrique",
        "obtenir_tuto",
      ]),
    "5 outils exposés"
  );
}

console.log("4. lister_tutoriels (sans clé)");
{
  const { text } = await callTool("lister_tutoriels", {});
  const data = JSON.parse(text);
  const byId = Object.fromEntries(data.tutoriels.map((t) => [t.id, t]));
  ok(data.tutoriels.length === 3, "3 tutoriels au catalogue");
  ok(byId["hello-mcp"].acces === "gratuit" && byId["hello-mcp"].debloque === true, "hello-mcp gratuit + débloqué");
  ok(byId["linkedin-crm"].acces === "payant" && byId["linkedin-crm"].debloque === false, "linkedin-crm payant + verrouillé");
}

console.log("5. obtenir_etape gratuit (hello-mcp, étape 1) — ouvert sans clé");
{
  const { text, isError } = await callTool("obtenir_etape", { id: "hello-mcp", n: 1 });
  ok(!isError && text.includes("Étape 1"), "contenu de l'étape renvoyé");
  ok(!text.includes("🔒"), "pas de paywall sur un tuto gratuit");
}

console.log("6. obtenir_etape payant SANS clé → paywall");
{
  const { text } = await callTool("obtenir_etape", { id: "make-subscenario", n: 1 });
  ok(text.includes("🔒") && text.includes("payant"), "paywall affiché");
  ok(text.includes("/achat/make-subscenario"), "lien d'achat présent dans le paywall");
}

console.log("7. obtenir_etape payant AVEC clé démo → contenu débloqué");
{
  const { text, isError } = await callTool("obtenir_etape", { id: "make-subscenario", n: 1 }, { cle: "cle-demo-tuto" });
  ok(!isError && !text.includes("🔒"), "contenu débloqué (pas de paywall)");
  ok(text.includes("Étape 1"), "contenu réel de l'étape 1");
}

console.log("8. clé spécifique via CLES_JSON (un seul tuto)");
{
  const env = { CLES_JSON: JSON.stringify({ "cle-linkedin": ["linkedin-crm"] }) };
  const a = await callTool("obtenir_etape", { id: "linkedin-crm", n: 1 }, { cle: "cle-linkedin", env });
  const b = await callTool("obtenir_etape", { id: "make-subscenario", n: 1 }, { cle: "cle-linkedin", env });
  ok(!a.text.includes("🔒"), "linkedin-crm débloqué par sa clé");
  ok(b.text.includes("🔒"), "make-subscenario reste verrouillé (clé ne le couvre pas)");
}

console.log("9. obtenir_rubrique gated + découpée par étape");
{
  const free = await callTool("obtenir_rubrique", { id: "hello-mcp", n: 2 });
  ok(!free.isError && free.text.startsWith("## Étape 2"), "rubrique étape 2 (gratuit) découpée");
  const locked = await callTool("obtenir_rubrique", { id: "make-subscenario", n: 2 });
  ok(locked.text.includes("🔒"), "rubrique d'un tuto payant gated");
}

console.log("10. lien_achat");
{
  const { text } = await callTool("lien_achat", { id: "linkedin-crm" });
  ok(text.endsWith("/achat/linkedin-crm"), "lien d'achat construit");
  const custom = await callTool("lien_achat", { id: "linkedin-crm" }, { env: { BASE_ACHAT_URL: "https://x.io/buy/" } });
  ok(custom.text === "https://x.io/buy/linkedin-crm", "BASE_ACHAT_URL respecté");
}

console.log("11. erreurs applicatives");
{
  const unknown = await callTool("obtenir_tuto", { id: "nope" });
  ok(unknown.isError && unknown.text.includes("inconnu"), "tuto inconnu → isError");
  const oob = await callTool("obtenir_etape", { id: "hello-mcp", n: 99 });
  ok(oob.isError && oob.text.includes("introuvable"), "étape hors bornes → isError");
}

console.log(`\n${pass} réussite(s), ${fail} échec(s).`);
process.exit(fail === 0 ? 0 : 1);
