# Serveur MCP (Astro) — comment-automatiser

Application **Astro** qui sert **le catalogue et le contenu des tutoriels** au plugin via un
endpoint **MCP**, avec un contrôle d'accès **gratuit / payant**. Le contenu vit dans des
**Content Collections** (typées, validées par Zod). Ce projet hébergera aussi la **landing page**
plus tard.

Deux bénéfices :
1. **Ajouter un tutoriel = ajouter du contenu ici**, il apparaît immédiatement chez tous les
   clients déjà équipés du plugin — **sans réinstallation**.
2. **Tutoriels payants** : le contenu d'un tuto `payant` n'est renvoyé qu'aux clés de licence qui
   l'ont débloqué ; sinon le serveur renvoie un **paywall** avec un lien d'achat.

La **vérification** (la « Loop ») reste **côté client** (sous-agent `verificateur` du plugin) : elle
inspecte les artefacts locaux de l'apprenant et appelle *ses* MCP. Le serveur fournit seulement la
**rubrique** de chaque étape.

## Pourquoi Astro

- **Content Collections** (`src/content/`) : contenu en markdown/YAML, **validé par un schéma Zod**.
  Remplace l'ancien `build-content.mjs` + bundle généré + `tuto.json` maison.
- **Endpoint serveur** (`src/pages/mcp.ts`) : route API `/mcp` rendue **à la demande** (SSR) qui
  reçoit un `Request` Web et renvoie une `Response` — le cœur MCP s'y branche tel quel.
- **Base pour la landing page** (`src/pages/index.astro`, à venir) alimentée par les mêmes
  collections.

## Architecture

```
server/
  astro.config.mjs         # adaptateur Node (standalone) + schéma astro:env
  src/
    content.config.ts      # définit les collections + schémas Zod
    content/
      tutoriels/<id>.yaml  # métadonnées : titre, niveau, acces (gratuit|payant)
      etapes/<id>/NN.md    # contenu d'une étape (entry.body = markdown brut)
      rubriques/<id>/NN.md # critères PASS/FAIL de l'étape
    lib/
      mcp.ts               # cœur MCP (JSON-RPC 2.0, Streamable HTTP) + 5 outils + paywall
      content.ts           # accès aux collections (listerTutoriels, getEtape, …)
      entitlements.ts      # resoudreDroits() — POINT D'EXTENSION (clé -> droits ; futur OAuth)
    pages/
      mcp.ts               # endpoint /mcp (prerender=false) qui délègue à lib/mcp.ts
  test/smoke.mjs           # test de fumée d'intégration (fetch sur le serveur)
```

## Outils MCP exposés

| Outil | Rôle | Gated ? |
|---|---|---|
| `lister_tutoriels` | catalogue `[{id,titre,niveau,acces,debloque,nbEtapes}]` | non (métadonnées) |
| `obtenir_tuto` | métadonnées d'un tuto + `debloque` | non |
| `obtenir_etape` | contenu de l'étape n | **oui** (paywall si payant non débloqué) |
| `obtenir_rubrique` | critères PASS/FAIL de l'étape n | **oui** |
| `lien_achat` | URL d'achat d'un tuto | non |

La **clé de licence** est lue dans le header `Authorization: Bearer <clé>` ou `X-Tuto-Cle: <clé>`.
`nbEtapes` est **dérivé** du nombre d'entrées `etapes` du tuto (rien à maintenir à la main).

## Développement

```bash
npm install
npm run dev        # http://localhost:4321  (endpoint : /mcp)

# Débloquer le contenu payant en local : clé démo intégrée « cle-demo-tuto »
curl -s localhost:4321/mcp -H 'content-type: application/json' \
  -H 'authorization: Bearer cle-demo-tuto' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"obtenir_etape","arguments":{"id":"linkedin-crm","n":1}}}'

# Test de fumée (serveur lancé, avec une clé scopée pour couvrir CLES_JSON) :
CLES_JSON='{"cle-linkedin":["linkedin-crm"]}' npm run dev   # dans un terminal
npm test                                                    # dans un autre
```

## Build & déploiement

```bash
npm run build                      # -> dist/ (adaptateur Node, standalone)
CLES_JSON='...' node ./dist/server/entry.mjs   # démarre le serveur (HOST/PORT en env)
```

Se déploie partout (Render, Fly.io, Docker, VPS). Reporte l'URL publique dans `TUTO_MCP_URL` côté
plugin (l'endpoint est `<origine>/mcp`).

> **Alternative Cloudflare Workers** (build vérifié) : `npm i @astrojs/cloudflare wrangler`, puis
> dans `astro.config.mjs` `import cloudflare from '@astrojs/cloudflare'` + `adapter: cloudflare()`,
> et `wrangler deploy`. Note : `astro dev` sous l'adaptateur Cloudflare (workerd) peut planter sur
> le logger JSON (« process is not defined ») ; d'où l'adaptateur **Node par défaut** pour un DX et
> une vérification locale fiables.

## Configuration (env / `astro:env`)

| Variable | Type | Rôle |
|----------|------|------|
| `CLES_JSON` | secret | Table clé → droits, ex. `{"cle-pack-pro":["*"]}` (`"*"` = tous les payants). |
| `BASE_ACHAT_URL` | public | Base des liens d'achat (défaut `https://comment-automatiser.fr/achat`). |
| `CLE_DEMO` | public | Mettre `off` en production pour désactiver la clé démo intégrée. |

Tout le mapping **identité → droits** est isolé dans `src/lib/entitlements.ts` (`resoudreDroits`).
Pour passer à **OAuth + Stripe** plus tard, réimplémenter cette seule fonction — ni le reste du
serveur ni le plugin ne changent.

## Ajouter un tutoriel (objectif « zéro réinstallation »)

1. `src/content/tutoriels/<id>.yaml` : `titre`, `niveau`, `acces` (`gratuit`|`payant`).
2. `src/content/etapes/<id>/01.md`, `02.md`, … : le contenu de chaque étape.
3. `src/content/rubriques/<id>/01.md`, `02.md`, … : les critères PASS/FAIL de chaque étape.
4. `npm test` (serveur lancé) puis `npm run build` et redéploie.

Le nouveau tuto apparaît aussitôt dans `/comment-automatiser:start` de **tous** les clients — aucun
`.zip` à re-téléverser.
