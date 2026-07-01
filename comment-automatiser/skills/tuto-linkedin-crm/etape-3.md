# Étape 3 — Crée le webhook Make (+ clé API) et récupère l'URL

## Objectif
Créer, dans **Make**, un **webhook** qui recevra ton image, le **sécuriser avec une clé API**, puis
copier son **URL**. C'est le point d'entrée entre ton iPhone et Make.

## Marche à suivre
1. Connecte-toi à [Make](https://www.make.com/en/register?pc=demandealeny) (compte gratuit possible).
2. Crée un **nouveau scénario** (*Create a new scenario*).
3. Ajoute un premier module : cherche **Webhooks** puis **Custom webhook**.
4. Clique **Add** (Ajouter) pour créer un nouveau webhook et **donne-lui un nom** (ex. `From LinkedIn`).
5. Déplie la section **API Key Authentication** → **Add API Key** :
   - donne un **nom** au trousseau (keychain),
   - saisis une **valeur** de clé (caractères ASCII, ≤ 512). **Conserve-la précieusement** : Make ne
     la réaffiche plus ensuite.
   - Cette clé devra être envoyée par le raccourci dans le header **`x-make-apikey`** (étape 4).
6. **Copie l'adresse du webhook** affichée (bouton *Copy address to clipboard*). Elle ressemble à :
   ```
   https://hook.<région>.make.com/<jeton>
   ```
   La **région** (`eu1`, `eu2`, `us1`, `us2`…) dépend de ton compte — garde **ta** valeur exacte.

## Sécurité 🔐
Ta **clé API** et l'**URL complète** (avec le jeton) sont des **secrets** : ne les colle jamais dans
un fichier versionné (git). Si tu es dans un contexte partagé, masque le jeton (`…`) quand tu me
donnes l'URL, et ne me donne pas la clé en clair.

## Quand c'est fait
Réponds « **fait** » en me confirmant :
- le **nom** de ton webhook,
- que tu as bien **créé une clé API** (sans la divulguer),
- et l'**URL** au format `https://hook.<région>.make.com/<jeton>` (le jeton peut être masqué).
