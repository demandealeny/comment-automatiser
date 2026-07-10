# comment-automatiser

Un **plugin Claude Code & Cowork** qui héberge des **tutoriels interactifs** pour apprendre
l'automatisation et les agents IA. Chaque tutoriel se déroule étape par étape et intègre une
**Loop de vérification** :
à chaque étape, un sous-agent contrôle **concrètement** que l'objectif est atteint avant de passer à
la suivante — pas de simple « j'ai fini, on continue ».

Le **contenu des tutoriels** (catalogue, étapes, rubriques) est servi par un **serveur MCP**
(dossier `server/`), pas figé dans le plugin. Deux conséquences :
- **Ajouter un tutoriel = le déployer côté serveur** → il apparaît immédiatement chez tous les
  clients déjà équipés, **sans réinstaller le plugin**.
- **Tutoriels gratuits et payants** : le serveur ne renvoie le contenu d'un tuto payant qu'aux clés
  de licence qui l'ont débloqué ; sinon il renvoie un **paywall** avec un lien d'achat.

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

- Télécharge le plugin comment-automatiser : c'est un fichier `.zip`
- Dans Claude Desktop, ouvre le menu Personnaliser dans la barre latérale gauche, puis va dans l'onglet Plugins
- Dans la section Plugins personnels, clique sur "Ajouter", puis choisis "Téléverser"
- Importe le fichier `.zip` téléchargé : le plugin est alors disponible dans ton Claude

Le plugin **embarque la connexion au serveur MCP** (`comment-automatiser/.mcp.json`). Deux variables
d'environnement le paramètrent :

| Variable | Rôle | Défaut |
|----------|------|--------|
| `TUTO_MCP_URL` | URL du serveur MCP déployé | `https://comment-automatiser-mcp.workers.dev/mcp` (à adapter) |
| `TUTO_CLE` | Clé de licence pour débloquer les tutos **payants** (optionnelle) | vide → accès aux tutos **gratuits** uniquement |

Une fois le plugin installé, vérifie la connexion avec `claude mcp list` (le serveur
`comment-automatiser` doit apparaître connecté). Les tutoriels **gratuits** fonctionnent sans clé.

## Utilisation

```text
/comment-automatiser:start            # affiche le catalogue des tutoriels
/comment-automatiser:start hello-mcp  # lance un tutoriel précis
/comment-automatiser:status           # montre ta progression (et reprise possible)
```

La progression est sauvegardée dans `${CLAUDE_PLUGIN_DATA}/progress.json` : tu peux fermer ta
session et **reprendre** plus tard là où tu t'étais arrêté.

## Tutoriels disponibles

Le catalogue est **servi dynamiquement par le serveur MCP** (`/comment-automatiser:start` appelle
`lister_tutoriels`). À l'amorçage, il contient :

| id | Titre | Niveau | Accès |
|----|-------|--------|-------|
| `hello-mcp` | Crée ton premier MCP avec [Make MCP Toolboxes](https://help.make.com/mcp-toolboxes) | Débutant | Gratuit |
| `linkedin-crm` | De LinkedIn à ton CRM (screenshot → IA → Google Sheets) | Intermédiaire | Payant |
| `make-subscenario` | Appeler un scénario Make depuis un autre (parent/enfant) | Intermédiaire | Payant |

## Architecture

Le dépôt contient **deux composants** : le **plugin** (client, à la racine + `comment-automatiser/`)
et le **serveur MCP** (`server/`) qui sert le contenu.

```
.claude-plugin/
  marketplace.json       # listing marketplace (à la racine du dépôt)
comment-automatiser/     # LE PLUGIN (source: "./comment-automatiser") — mince et stable
  .claude-plugin/
    plugin.json          # manifeste du plugin
  .mcp.json              # embarque la connexion au serveur MCP (TUTO_MCP_URL / TUTO_CLE)
  skills/
    start/SKILL.md       # /comment-automatiser:start — catalogue (via MCP) + lancement
    status/SKILL.md      # /comment-automatiser:status — progression
    tuto/SKILL.md        # orchestrateur GÉNÉRIQUE (un seul, data-driven) — pilote la Loop
  agents/
    verificateur.md      # sous-agent de vérification (lecture seule) — INCHANGÉ
  hooks/hooks.json       # SessionStart → rappel discret
  scripts/progress.sh    # suivi de progression (JSON persistant, Python 3, sans jq)

server/                  # LE SERVEUR MCP (contenu + accès gratuit/payant) — voir server/README.md
  content/<id>/          # source de vérité d'un tuto : tuto.json + etape-*.md + rubrique-verif.md
  src/                   # mcp.js (protocole), content.js, entitlements.js, index.js (Workers)
  ...
```

Le plugin ne contient **plus** le contenu des tutoriels : il l'obtient du serveur via les outils
MCP `lister_tutoriels`, `obtenir_tuto`, `obtenir_etape`, `obtenir_rubrique`, `lien_achat`. Un
**seul** orchestrateur générique (`skills/tuto/`) déroule n'importe quel tuto.

## Ajouter un tutoriel

Désormais **côté serveur uniquement** — plus aucune réinstallation du plugin. Voir
[`server/README.md`](server/README.md) :

1. Créer `server/content/<nouvel-id>/` (`tuto.json` + `etape-*.md` + `rubrique-verif.md`).
2. `cd server && npm run build:content && npm test`.
3. `npx wrangler deploy`.

Le tuto apparaît aussitôt dans `/comment-automatiser:start` chez tous les clients. Le champ `acces`
(`gratuit`/`payant`) du `tuto.json` décide s'il est verrouillé derrière une clé de licence.

### Bonnes pratiques de vérification
- Privilégie une preuve **observable** (fichier, commande, appel MCP réel) ; ne tombe sur du Q&A que
  pour les étapes purement conceptuelles.
- En cas de doute, le vérificateur renvoie **FAIL** + un indice : mieux vaut reboucler que valider à
  tort.
- Ne demande jamais de committer un secret (clé d'API/MCP) ; garde-le hors du dépôt.

## Licence

Voir [LICENSE](LICENSE).
