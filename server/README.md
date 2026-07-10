# Serveur MCP — comment-automatiser

Serveur MCP qui sert **le catalogue et le contenu des tutoriels** au plugin, avec un
contrôle d'accès **gratuit / payant**. Il remplace le contenu qui était auparavant figé dans
le `.zip` du plugin.

Deux bénéfices :
1. **Ajouter un tutoriel = le déployer ici**, il apparaît immédiatement chez tous les clients
   déjà équipés du plugin — **sans réinstallation**.
2. **Tutoriels payants** : le contenu d'un tuto `payant` n'est renvoyé qu'aux clés de licence
   qui l'ont débloqué ; sinon le serveur renvoie un **paywall** avec un lien d'achat.

La **vérification** (la « Loop ») reste **côté client** (sous-agent `verificateur` du plugin) :
elle doit inspecter les artefacts locaux de l'apprenant et appeler *ses* MCP — un serveur
distant ne peut pas le faire. Le serveur fournit seulement la **rubrique** de chaque étape.

## Architecture

```
server/
  content/<id>/            # SOURCE de vérité d'un tutoriel (markdown + manifeste)
    tuto.json              #   { id, titre, niveau, acces: gratuit|payant, nbEtapes }
    etape-1.md … etape-N.md
    rubrique-verif.md      #   critères PASS/FAIL, découpés par « ## Étape N »
  scripts/build-content.mjs   # content/ -> src/generated/content.js (bundle portable)
  src/
    generated/content.js   # bundle généré (Node + Workers), NE PAS éditer à la main
    content.js             # accès catalogue / étapes / rubriques
    entitlements.js        # resoudreDroits() — POINT D'EXTENSION (clé -> droits ; futur OAuth)
    mcp.js                 # protocole MCP Streamable HTTP + 5 outils + paywall
    index.js               # entrée Cloudflare Workers
  dev-server.js            # serveur HTTP Node local (dev/tests manuels)
  test/smoke.mjs           # test de fumée (aucun réseau)
  wrangler.toml            # config déploiement Workers
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

## Développement

```bash
npm run build:content   # (re)génère le bundle après toute modif de content/
npm test                # test de fumée (22 assertions)
npm run dev             # serveur local http://localhost:8787/mcp

# Exemple d'appel :
curl -s localhost:8787/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Contenu payant débloqué avec la clé démo intégrée :
curl -s localhost:8787/mcp -H 'content-type: application/json' \
  -H 'authorization: Bearer cle-demo-tuto' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"obtenir_etape","arguments":{"id":"linkedin-crm","n":1}}}'
```

## Déploiement (Cloudflare Workers)

```bash
npm run build:content
npx wrangler deploy
# Définir la table clé -> droits (secret) :
npx wrangler secret put CLES_JSON
#   ex. {"cle-client-abc":["linkedin-crm"],"cle-pack-pro":["*"]}
```

Reporte l'URL déployée dans la config MCP du plugin (`TUTO_MCP_URL`, voir
`comment-automatiser/.mcp.json`). **En production**, désactive la clé démo intégrée en
ajoutant la var `CLE_DEMO = "off"`.

## Gestion des accès (gratuit / payant)

- Un tuto est **gratuit** ou **payant** selon `acces` dans son `tuto.json`.
- Les droits d'une clé sont dans le secret `CLES_JSON` : `{ "<clé>": ["<id>", ...] }`.
  La valeur `"*"` débloque **tous** les tutos payants.
- Tout le mapping identité → droits est isolé dans `src/entitlements.js` (`resoudreDroits`).
  Pour passer à **OAuth + Stripe** plus tard, il suffit de réimplémenter cette fonction :
  **ni le reste du serveur ni le plugin ne changent**.

## Ajouter un tutoriel (objectif « zéro réinstallation »)

1. Créer `content/<nouvel-id>/` avec `tuto.json`, `etape-1.md…`, `rubrique-verif.md`
   (mêmes conventions que les tutos existants ; titres de rubrique `## Étape N`).
2. `npm run build:content && npm test`.
3. `npx wrangler deploy`.

Le nouveau tuto apparaît aussitôt dans `/comment-automatiser:start` de **tous** les clients —
aucun `.zip` à re-téléverser.
