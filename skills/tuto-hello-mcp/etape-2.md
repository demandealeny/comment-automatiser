# Étape 2 — Crée ta MCP Toolbox et récupère clé + URL

## Objectif
Créer une **MCP Toolbox** dans Make qui expose ton scénario de l'étape 1, puis générer une **clé**
et copier l'**URL du serveur MCP**.

## Marche à suivre
1. Dans Make, ouvre **MCP Toolboxes** (barre latérale gauche).
2. Clique **Create toolbox** (en haut), puis **donne-lui un nom** (ex. `ma-premiere-toolbox`).
3. Dans l'onglet **Tools**, **sélectionne le scénario** créé à l'étape 1.
   - S'il n'apparaît pas : reviens à l'étape 1 — il doit être **actif** et en **on-demand**.
   - Optionnel : ajuste le **label**, la **description** et le **type** de l'outil pour qu'il soit
     clair pour l'IA.
4. Crée une **clé** : dans la boîte **Create key**, **copie et conserve la clé** en lieu sûr
   (elle ne sera plus réaffichée).
5. Copie l'**MCP Server URL** affichée pour la toolbox.

## Forme de l'URL finale
L'URL à utiliser dans un client se construit ainsi :

```
<MCP Server URL>/t/<ta-clé>/<transport>
```

Transport recommandé : **`stateless`** (Stateless Streamable HTTP, le plus fiable). Exemple :

```
https://eu1.make.com/mcp/api/v1/u/<...>/t/<ta-clé>/stateless
```

## Sécurité 🔐
Ta **clé** est un **secret** : ne la colle nulle part dans un fichier qui serait versionné (git).
On verra à l'étape 3 comment la garder hors du dépôt.

## Quand c'est fait
Réponds « **fait** » en me confirmant :
- le **nom de la toolbox**,
- que tu as bien **une clé** (ne me la colle pas en clair si tu es dans un contexte partagé),
- et l'**URL** au format `.../t/<clé>/stateless` (tu peux masquer la clé par `***`).
