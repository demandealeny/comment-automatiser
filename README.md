# comment-automatiser

Un **plugin Claude Code & Cowork** qui héberge des **tutoriels interactifs** pour apprendre
l'automatisation et les agents IA. Chaque tutoriel se déroule étape par étape et intègre une
**Loop de vérification** :
à chaque étape, un sous-agent contrôle **concrètement** que l'objectif est atteint avant de passer à
la suivante — pas de simple « j'ai fini, on continue ».

## Pourquoi une « Loop » ?

L'apprenant ne se contente pas de cliquer « suivant ». Quand il déclare avoir terminé une étape, le
plugin **dépêche un sous-agent vérificateur** qui :
- inspecte un artefact réel (fichier, configuration, sortie de commande),
- **appelle réellement** un MCP quand c'est pertinent,
- ou évalue une réponse pour les étapes conceptuelles.

Il renvoie un verdict **PASS / FAIL** court. Sur `FAIL`, on **reboucle** sur la même étape avec un
indice. Bonus : la vérification tourne dans un **contexte isolé**, donc le bruit des outils
**n'encombre pas** la conversation principale.

## Installation

Voici les étapes correctes pour ajouter le plugin :

- Ouvre le menu Personnaliser dans la barre latérale gauche, puis va dans l'onglet Plugins
- Dans la section Plugins personnels, clique sur le bouton "+", puis choisis "Ajouter un marketplace"
- Sélectionne "Ajouter depuis un dépôt" et colle l'URL : https://github.com/demandealeny/comment-automatiser
- Une fois le marketplace ajouté, parcours les plugins disponibles et clique sur "Installer"

## Utilisation

```text
/comment-automatiser:start            # affiche le catalogue des tutoriels
/comment-automatiser:start hello-mcp  # lance un tutoriel précis
/comment-automatiser:status           # montre ta progression (et reprise possible)
```

La progression est sauvegardée dans `${CLAUDE_PLUGIN_DATA}/progress.json` : tu peux fermer ta
session et **reprendre** plus tard là où tu t'étais arrêté.

## Tutoriels disponibles

| id | Titre | Niveau |
|----|-------|--------|
| `hello-mcp` | Crée ton premier MCP avec [Make MCP Toolboxes](https://help.make.com/mcp-toolboxes) | Débutant |
| `linkedin-crm` | De LinkedIn à ton CRM (screenshot → IA → Google Sheets) | Intermédiaire |

## Architecture

Le dépôt est un **marketplace** (à la racine) contenant **un plugin** dans son propre sous-dossier
`comment-automatiser/` — le format attendu par Claude Code **et** la synchro Claude.ai/Cowork.

```
.claude-plugin/
  marketplace.json       # listing marketplace (à la racine du dépôt)
comment-automatiser/     # le plugin (source: "./comment-automatiser")
  .claude-plugin/
    plugin.json          # manifeste du plugin
  commands/
    start.md             # /comment-automatiser:start — catalogue + lancement
    status.md            # /comment-automatiser:status — progression
  skills/
    tuto-hello-mcp/
      SKILL.md           # orchestrateur du tuto (déroule les étapes + pilote la Loop)
      etape-1.md         # contenu, chargé à la demande
      etape-2.md
      etape-3.md
      rubrique-verif.md  # critères PASS/FAIL lus par le vérificateur
  agents/
    verificateur.md      # sous-agent de vérification (lecture seule) — repli inline en Cowork
  hooks/
    hooks.json           # SessionStart → rappel discret (Claude Code ; ignoré par Cowork)
  scripts/
    progress.sh          # suivi de progression (JSON persistant, via Python 3 — sans jq)
```

## Ajouter un tutoriel

Le plugin est **data-driven** : un tutoriel = un dossier `skills/tuto-<id>/`.

1. **Créer le dossier** `skills/tuto-<id>/` avec :
   - `SKILL.md` : copie l'orchestrateur de `tuto-hello-mcp` et adapte l'`id`, le nombre d'étapes et
     les chemins. La logique de Loop reste identique.
   - `etape-1.md`, `etape-2.md`, … : le contenu de chaque étape (objectif + marche à suivre +
     ce que l'apprenant doit fournir pour être vérifié).
   - `rubrique-verif.md` : les critères `PASS/FAIL` de chaque étape, lus par le vérificateur.
2. **Référencer le tuto** dans le catalogue de `commands/start.md` (une ligne dans le tableau).
3. C'est tout : le sous-agent `verificateur` et le suivi `progress.sh` sont **partagés** par tous les
   tutoriels, rien d'autre à brancher.

### Bonnes pratiques de vérification
- Privilégie une preuve **observable** (fichier, commande, appel MCP réel) ; ne tombe sur du Q&A que
  pour les étapes purement conceptuelles.
- En cas de doute, le vérificateur renvoie **FAIL** + un indice : mieux vaut reboucler que valider à
  tort.
- Ne demande jamais de committer un secret (clé d'API/MCP) ; garde-le hors du dépôt.

## Licence

Voir [LICENSE](LICENSE).
