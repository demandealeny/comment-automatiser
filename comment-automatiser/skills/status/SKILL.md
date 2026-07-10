---
name: status
description: Affiche la progression de l'apprenant dans les tutoriels « comment-automatiser ».
disable-model-invocation: true
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/progress.sh:*)
---

# Progression — comment-automatiser

Avec l'outil **Bash**, exécute cette commande pour lire l'état de progression brut :

```
${CLAUDE_PLUGIN_ROOT}/scripts/progress.sh load
```

À partir de ce JSON, présente à l'apprenant un récapitulatif clair en français :

- Pour chaque tutoriel présent dans `tutorials` :
  - son titre lisible (`hello-mcp` → « Crée ton premier MCP avec Make MCP Toolboxes ») ;
  - son statut : **en cours (étape N / total)** ou **terminé ✅** ;
  - les étapes déjà validées.
- Si aucun tutoriel n'est commencé, dis-le simplement et propose `/comment-automatiser:start`
  pour découvrir le catalogue.

Reste bref : un petit tableau ou une liste suffit.
