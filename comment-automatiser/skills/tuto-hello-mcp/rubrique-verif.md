# Rubrique de vérification — tuto « hello-mcp »

Critères que le `verificateur` applique à chaque étape. Verdict `PASS` seulement si **tous** les
critères de l'étape sont satisfaits, sur preuve observée (pas sur la simple déclaration).

## Étape 1 — Scénario Make éligible
Nature : déclarative (l'état vit chez Make, non inspectable directement). Vérification par Q&A ciblé.
- [ ] L'apprenant nomme un **scénario** précis qu'il a créé.
- [ ] Il confirme que le scénario est **actif** (ON).
- [ ] Il confirme une planification **« on demand »** (à la demande), pas un intervalle.
- FAIL si l'un manque, est vague, ou si le scheduling n'est pas on-demand (sinon l'outil
  n'apparaîtra pas en étape 2). Indice : rappeler la condition active + on-demand.

## Étape 2 — MCP Toolbox créée (clé + URL)
Nature : déclarative + contrôle de forme de l'URL.
- [ ] L'apprenant nomme sa **toolbox**.
- [ ] Il confirme avoir **généré une clé** (sans forcément la divulguer).
- [ ] Il fournit une **URL** cohérente avec le format Make :
      se termine par **`/t/<clé>/stateless`** (la clé peut être masquée par `***`).
- FAIL si l'URL ne suit pas la forme `.../t/<clé>/<transport>` ou si le transport n'est pas
  `stateless`/`sse`/`streamable`. Indice : reconstruire l'URL `<MCP Server URL>/t/<clé>/stateless`.

## Étape 3 — MCP branché et appelé (vérification réelle)
Nature : **observable** — c'est ici que la Loop teste concrètement.
- [ ] Un serveur MCP correspondant à la toolbox est **configuré** dans Claude Code
      (visible via `claude mcp list`, statut connecté).
- [ ] Le vérificateur **appelle réellement** l'outil exposé (`mcp__<serveur>__<outil>`) **ou**, à
      défaut d'accès direct à l'outil dans son contexte, confirme via `claude mcp list` que le
      serveur est **connecté** ET que l'apprenant rapporte une **réponse réelle** plausible.
- [ ] L'appel renvoie une **réponse** (pas une erreur d'auth / 4xx / timeout).
- FAIL si le serveur est absent/déconnecté, si l'outil ne répond pas, ou si la « réponse » rapportée
  est manifestement inventée/incohérente. Indice : vérifier l'URL + la clé, le suffixe `/stateless`,
  et que le scénario Make est toujours actif.
