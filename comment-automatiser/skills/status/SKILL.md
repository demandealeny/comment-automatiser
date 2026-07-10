---
name: status
description: Affiche la progression de l'apprenant dans les tutoriels « comment-automatiser ».
disable-model-invocation: true
allowed-tools: >-
  Bash(${CLAUDE_PLUGIN_ROOT}/scripts/progress.sh:*),
  mcp__comment-automatiser__lister_tutoriels
---

# Progression — comment-automatiser

1. Lis l'état de progression brut avec l'outil **Bash** :

   ```
   ${CLAUDE_PLUGIN_ROOT}/scripts/progress.sh load
   ```

2. Récupère les **titres lisibles** depuis le catalogue via l'outil
   `mcp__comment-automatiser__lister_tutoriels` (mappe `id` → `titre`). Si le serveur MCP est
   indisponible, affiche quand même la progression en te contentant des `id`.

À partir de ces deux sources, présente à l'apprenant un récapitulatif clair en français :

- Pour chaque tutoriel présent dans `tutorials` (progression) :
  - son **titre** lisible (issu du catalogue MCP ; repli sur l'`id`) ;
  - son statut : **en cours (étape N / total)** ou **terminé ✅** ;
  - les étapes déjà validées.
- Si aucun tutoriel n'est commencé, dis-le simplement et propose `/comment-automatiser:start`
  pour découvrir le catalogue.

Reste bref : un petit tableau ou une liste suffit.
