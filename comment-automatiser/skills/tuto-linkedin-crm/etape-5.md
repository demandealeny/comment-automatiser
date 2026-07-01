# Étape 5 — Ajoute le module IA qui lit l'image (Make AI Agents)

## Objectif
Après le webhook, ajouter un module **Make AI Agents › Run an agent** qui **lit l'image reçue** et en
**extrait les infos du contact** sous forme **structurée** : `Prénom`, `Nom`, `LinkedInURL`, `Role`.

## Pourquoi
L'image ne suffit pas pour un CRM : il faut des **champs**. Une IA multimodale lit l'image combinée
(profil + coordonnées) et renvoie un objet propre, prêt à ranger en colonnes à l'étape suivante.

## Prérequis
L'étape 4 doit être validée : le webhook a **déjà reçu une image**, donc sa sortie (le fichier, champ
`1. value`) est disponible pour être mappée ici.

## Marche à suivre
1. Après le module **Webhook**, ajoute un module : cherche **Make AI Agents**, puis **Run an agent**.
2. **Connection** : choisis/crée une connexion **AI provider**. Le plus simple : le **fournisseur IA
   de Make** (pas de clé à gérer). *(Alternative : brancher ta propre clé **OpenAI / Anthropic
   (Claude) / Gemini** — le champ Connection les accepte.)*
3. **Model** : un petit modèle rapide suffit (ex. *small* / `gpt-5-nano`). **Reasoning effort** : *Low*.
4. **Instructions** (system prompt) :
   > Tu es un agent qui extrait des données depuis une image.
5. **Input** :
   > Tu dois extraire les informations de ce contact LinkedIn.
6. **Input files** → ajoute un fichier :
   - **File name** : `{{var.scenario.executionId}}.jpg` (un nom unique par exécution),
   - **Data** : mappe la **sortie du webhook** = le fichier reçu (**`1. value`**).
7. **Response format** : **Data structure**.
8. **Response structure** : ajoute **4 champs** (Type = *Text*, *required*) :
   `Prénom`, `Nom`, `LinkedInURL`, `Role` (une courte description chacun aide l'IA).

## Teste-le tout de suite
Fais un **clic droit** sur le module IA → **Run this module only** : il réutilise le dernier bundle
reçu par le webhook et doit renvoyer un **`jsonResponse`** contenant tes 4 champs remplis.

## Quand c'est fait
Réponds « **fait** » en me donnant les **4 champs extraits** par l'IA lors de ton test
(`Prénom`, `Nom`, `LinkedInURL`, `Role`) et en confirmant : Response format = **Data structure**,
fichier d'entrée mappé sur la sortie du webhook (`1. value`).
