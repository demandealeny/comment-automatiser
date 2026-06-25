# Étape 3 — Branche ton MCP dans Claude Code et appelle-le

## Objectif
Connecter ta MCP Toolbox à **Claude Code** comme serveur MCP, puis **appeler réellement l'outil**
pour vérifier que toute la chaîne fonctionne.

## Marche à suivre

### A. Ajouter le serveur MCP
Le plus simple, en ligne de commande (transport HTTP) :

```bash
claude mcp add --transport http ma-toolbox "https://<...>/t/<ta-clé>/stateless"
```

- Remplace l'URL par la tienne (étape 2), avec le suffixe **`/stateless`**.
- `ma-toolbox` est le nom local que tu donnes au serveur.

> 🔐 **Garde la clé hors du dépôt.** Évite de committer l'URL avec la clé en clair. Préfère un
> scope **local** (non versionné) ou une variable d'environnement, par exemple :
> ```bash
> claude mcp add --transport http --scope local ma-toolbox "$MAKE_MCP_URL"
> ```
> où `MAKE_MCP_URL` contient ton URL complète. Ne mets jamais la clé dans un fichier suivi par git.

### B. Vérifier la connexion
```bash
claude mcp list
```
Ta toolbox doit apparaître **connectée**. Dans une session, les outils exposés portent un nom
du type `mcp__ma-toolbox__<nom-du-scénario>`.

### C. Appeler l'outil
Dans Claude Code, demande à utiliser l'outil de ta toolbox (celui correspondant à ton scénario de
l'étape 1) et observe la **réponse réelle** renvoyée par Make.

## Quand c'est fait
Réponds « **fait** » en me donnant :
- le **nom local** du serveur MCP que tu as ajouté (ex. `ma-toolbox`),
- le **nom de l'outil** appelé,
- et **ce que l'appel a renvoyé** (la réponse de ton scénario).

Je lancerai alors une dernière vérification qui **appelle l'outil** pour confirmer que tout répond. 🎉
