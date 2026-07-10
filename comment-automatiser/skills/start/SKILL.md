---
name: start
description: Lance le menu des tutoriels « comment-automatiser » ou démarre un tutoriel précis.
disable-model-invocation: true
argument-hint: "[id-du-tuto]"
allowed-tools: >-
  Skill,
  Bash(${CLAUDE_PLUGIN_ROOT}/scripts/progress.sh:*),
  mcp__comment-automatiser__lister_tutoriels,
  mcp__comment-automatiser__lien_achat
---

# Menu des tutoriels — comment-automatiser

L'apprenant a tapé `/comment-automatiser:start $ARGUMENTS`.

Le catalogue n'est **plus en dur** : il est servi par le serveur MCP `comment-automatiser`. De
nouveaux tutoriels peuvent donc apparaître **sans réinstaller le plugin**.

## Ce que tu dois faire

1. **Charge le catalogue** : appelle l'outil `mcp__comment-automatiser__lister_tutoriels`.
   Tu obtiens une liste d'objets `{ id, titre, niveau, acces, debloque, nbEtapes }`.
   - Si l'outil est indisponible (serveur non configuré/joignable) : explique que le serveur de
     tutoriels n'est pas connecté et invite à vérifier la config MCP (`claude mcp list`) et la
     variable `TUTO_MCP_URL`. N'invente pas de catalogue.

2. **Si `$ARGUMENTS` correspond à un `id` du catalogue** :
   - Invoque immédiatement la skill générique `comment-automatiser:tuto` via l'outil **Skill**, en
     lui passant l'`id` en argument. N'explique pas, lance le tuto (la skill `tuto` gère l'accès,
     le paywall éventuel et la reprise).

3. **Si `$ARGUMENTS` est vide ou inconnu** :
   - Affiche le catalogue de façon claire et accueillante (français, ton chaleureux), sous forme de
     petit tableau : **Titre**, **Niveau**, **Accès**, **Statut de progression**.
     - **Accès** : « Gratuit » si `acces=gratuit` ; sinon « Payant 🔒 » si `debloque=false`,
       ou « Payant ✅ » si `debloque=true`.
     - Pour le **statut**, lis la progression avec
       `${CLAUDE_PLUGIN_ROOT}/scripts/progress.sh load` et indique, par tuto :
       non commencé / en cours (étape N/total) / terminé ✅.
   - Pour chaque tuto **payant et verrouillé** (`debloque=false`), tu peux appeler `lien_achat`
     `{ "id": "<id>" }` et proposer le lien pour le débloquer, en précisant qu'il faut ensuite
     renseigner sa **clé de licence** (variable `TUTO_CLE`).
   - Termine en invitant l'apprenant à relancer `/comment-automatiser:start <id>` avec l'id choisi.

Reste concis. Ne déroule pas le contenu d'un tutoriel ici : c'est le rôle de la skill `tuto`.
