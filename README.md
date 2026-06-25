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

### Dans Claude Code (CLI)

```bash
# 1. Ajouter ce dépôt comme marketplace
/plugin marketplace add demandealeny/comment-automatiser

# 2. Installer le plugin
/plugin install comment-automatiser
```

Pour développer localement : `claude --plugin-dir /chemin/vers/comment-automatiser`

### Dans Cowork (claude.ai)

Cowork lit **le même format de plugin** que Claude Code, via le marketplace intégré :

1. Ajoute ce dépôt comme marketplace (`/plugin marketplace add demandealeny/comment-automatiser`),
   ou ouvre **Browse plugins** dans Cowork.
2. Clique **Install** sur `comment-automatiser`.

Les commandes (`/comment-automatiser:start`, `:status`), la skill du tuto et le sous-agent
`verificateur` fonctionnent à l'identique. Seule différence connue : Cowork **n'exécute pas encore
les hooks `SessionStart`** ([feature request](https://github.com/anthropics/claude-code/issues/47993)),
donc le rappel automatique des tutos en cours ne s'affiche pas — sans impact sur le déroulé, car
`/comment-automatiser:start` et `:status` chargent la progression eux-mêmes.

Prérequis : **Python 3** (présent par défaut dans les environnements Claude Code et Cowork ; aucune
autre dépendance — pas besoin de `jq`).

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

## Architecture

```
.claude-plugin/
  plugin.json          # manifeste du plugin
  marketplace.json     # listing marketplace (installation)
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
  verificateur.md      # sous-agent de vérification (lecture seule, renvoie un verdict)
hooks/
  hooks.json           # SessionStart → rappel discret si un tuto est en cours (Claude Code ; ignoré par Cowork)
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
