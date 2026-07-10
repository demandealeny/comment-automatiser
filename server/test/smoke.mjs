// Test de fumée d'intégration — interroge le serveur MCP Astro par HTTP.
// Prérequis : un serveur en cours (`npm run dev`) avec, pour couvrir les clés :
//   CLES_JSON='{"cle-linkedin":["linkedin-crm"]}' npm run dev
// Usage : node test/smoke.mjs   (BASE_URL par défaut http://localhost:4321)

const BASE = process.env.BASE_URL || "http://localhost:4321";
const URL = `${BASE}/mcp`;

let pass = 0;
let fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.log(`  ❌ ${label}`); }
}

async function rpc(body, cle) {
  const headers = { "content-type": "application/json" };
  if (cle) headers["x-tuto-cle"] = cle;
  const res = await fetch(URL, { method: "POST", headers, body: JSON.stringify(body) });
  if (res.status === 202) return { _notification: true };
  return res.json();
}
async function callTool(name, args, cle) {
  const out = await rpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }, cle);
  const r = out.result || {};
  return { text: r.content?.[0]?.text ?? "", isError: Boolean(r.isError) };
}

console.log("1. initialize");
{
  const out = await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } });
  ok(out.result?.serverInfo?.name === "comment-automatiser", "serverInfo");
  ok(out.result?.protocolVersion === "2025-06-18", "protocolVersion échoée");
  ok(Boolean(out.result?.capabilities?.tools), "capacité tools");
}

console.log("2. notifications/initialized → 202");
ok((await rpc({ jsonrpc: "2.0", method: "notifications/initialized" }))._notification === true, "notification acceptée");

console.log("3. tools/list");
{
  const out = await rpc({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  const names = (out.result.tools || []).map((t) => t.name).sort();
  ok(JSON.stringify(names) === JSON.stringify(["lien_achat", "lister_tutoriels", "obtenir_etape", "obtenir_rubrique", "obtenir_tuto"]), "5 outils");
}

console.log("4. lister_tutoriels (sans clé)");
{
  const { text } = await callTool("lister_tutoriels", {});
  const byId = Object.fromEntries(JSON.parse(text).tutoriels.map((t) => [t.id, t]));
  ok(Object.keys(byId).length === 3, "3 tutoriels");
  ok(byId["hello-mcp"].acces === "gratuit" && byId["hello-mcp"].debloque === true && byId["hello-mcp"].nbEtapes === 3, "hello-mcp gratuit, débloqué, 3 étapes");
  ok(byId["linkedin-crm"].acces === "payant" && byId["linkedin-crm"].debloque === false && byId["linkedin-crm"].nbEtapes === 8, "linkedin-crm payant, verrouillé, 8 étapes");
  ok(byId["make-subscenario"].nbEtapes === 6, "make-subscenario 6 étapes (dérivé)");
}

console.log("5. obtenir_etape gratuit ouvert sans clé");
{
  const { text, isError } = await callTool("obtenir_etape", { id: "hello-mcp", n: 1 });
  ok(!isError && text.includes("Étape 1") && !text.includes("🔒"), "contenu étape 1 (gratuit)");
}

console.log("6. obtenir_etape payant sans clé → paywall");
{
  const { text } = await callTool("obtenir_etape", { id: "make-subscenario", n: 1 });
  ok(text.includes("🔒") && text.includes("/achat/make-subscenario"), "paywall + lien d'achat");
}

console.log("7. obtenir_etape payant AVEC clé démo → débloqué");
{
  const { text, isError } = await callTool("obtenir_etape", { id: "make-subscenario", n: 1 }, "cle-demo-tuto");
  ok(!isError && !text.includes("🔒") && text.includes("Étape 1"), "contenu débloqué");
}

console.log("8. clé scopée (CLES_JSON cle-linkedin → linkedin-crm seulement)");
{
  const a = await callTool("obtenir_etape", { id: "linkedin-crm", n: 1 }, "cle-linkedin");
  const b = await callTool("obtenir_etape", { id: "make-subscenario", n: 1 }, "cle-linkedin");
  ok(!a.text.includes("🔒"), "linkedin-crm débloqué par sa clé");
  ok(b.text.includes("🔒"), "make-subscenario reste verrouillé");
}

console.log("9. obtenir_rubrique gated + par étape");
{
  const free = await callTool("obtenir_rubrique", { id: "hello-mcp", n: 2 });
  ok(!free.isError && free.text.startsWith("## Étape 2"), "rubrique étape 2 (gratuit) découpée");
  ok((await callTool("obtenir_rubrique", { id: "make-subscenario", n: 2 })).text.includes("🔒"), "rubrique payante gated");
}

console.log("10. lien_achat + erreurs");
{
  ok((await callTool("lien_achat", { id: "linkedin-crm" })).text.endsWith("/achat/linkedin-crm"), "lien d'achat");
  ok((await callTool("obtenir_tuto", { id: "nope" })).isError, "tuto inconnu → isError");
  ok((await callTool("obtenir_etape", { id: "hello-mcp", n: 99 })).isError, "étape hors bornes → isError");
}

console.log(`\n${pass} réussite(s), ${fail} échec(s).`);
process.exit(fail === 0 ? 0 : 1);
