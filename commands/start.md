---
name: start
description: Lance le menu des tutoriels « comment-automatiser » ou démarre un tutoriel précis.
disable-model-invocation: true
argument-hint: "[id-du-tuto]"
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/progress.sh:*), Skill
---

# Menu des tutoriels — comment-automatiser

L'apprenant a tapé `/comment-automatiser:start $ARGUMENTS`.

## Catalogue des tutoriels disponibles

> Pour ajouter un tutoriel : créer un dossier `skills/tuto-<id>/` et ajouter une ligne ici.

| id | Titre | Skill à invoquer | Niveau |
|----|-------|------------------|--------|
| `hello-mcp` | Crée ton premier MCP avec Make MCP Toolboxes | `comment-automatiser:tuto-hello-mcp` | Débutant |

## Ce que tu dois faire

1. Lis l'argument fourni : `$ARGUMENTS`.
2. **Si l'argument correspond à un `id` du catalogue** (ex. `hello-mcp`) :
   - Invoque immédiatement la skill correspondante via l'outil Skill
     (ex. skill `comment-automatiser:tuto-hello-mcp`). N'explique pas, lance le tuto.
3. **Si l'argument est vide ou inconnu** :
   - Affiche le catalogue ci-dessus de façon claire et accueillante (en français, ton chaleureux).
   - Pour situer l'apprenant, lis la progression existante avec :
     `${CLAUDE_PLUGIN_ROOT}/scripts/progress.sh load`
     et, à côté de chaque tuto, indique son statut (non commencé / en cours étape N / terminé ✅).
   - Termine en invitant l'apprenant à relancer `/comment-automatiser:start <id>` avec l'id choisi.

Reste concis. Ne déroule pas le contenu d'un tutoriel ici : c'est le rôle de la skill du tuto.
