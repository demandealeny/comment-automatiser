# Rubrique de vérification — tuto « linkedin-crm »

Critères que le `verificateur` applique à chaque étape. Verdict `PASS` seulement si **tous** les
critères de l'étape sont satisfaits, sur la base des **preuves rapportées** par l'apprenant (les
artefacts vivent sur l'iPhone et dans Make/Google, non inspectables directement — voir le contexte
de vérification du SKILL). Les étapes **4, 5 et 8** exigent une **preuve d'exécution réelle** ; les
autres sont déclaratives.

## Étape 1 — Raccourci + 2 captures
Nature : déclarative (état sur l'iPhone). Vérification par Q&A ciblé.
- [ ] L'apprenant décrit un raccourci contenant, **dans l'ordre** : ouvrir LinkedIn → capture →
      enregistrer (Recents) → **alerte** (pause) → capture → enregistrer (Recents).
- [ ] Le texte de l'alerte guide vers le panneau **coordonnées** (les 3 points, puis OK).
- [ ] Il confirme que l'exécution enregistre **2 captures** dans *Recents*.
- FAIL si une action manque, si l'ordre est incohérent, ou si l'alerte/la pause est absente.
  Indice : rappeler l'enchaînement capture → alerte (pause) → capture, avec 2 enregistrements.

## Étape 2 — Image combinée
Nature : déclarative.
- [ ] Le raccourci ajoute **Get Latest Photos** réglé sur **2**.
- [ ] Puis **Combine Images** en mode **Horizontally** (sortie *Combined Image*).
- [ ] L'exécution produit **une seule** image combinée (les 2 écrans côte à côte).
- FAIL si le nombre n'est pas 2, si le mode n'est pas horizontal, ou si aucune image unique n'est
  produite. Indice : `Get Latest Photos (2)` → `Combine Images (Horizontally)`.

## Étape 3 — Webhook Make créé (URL + clé API)
Nature : déclarative + contrôle de forme de l'URL.
- [ ] L'apprenant nomme son **webhook** (Custom webhook).
- [ ] Il confirme avoir **créé une clé API** (sans forcément la divulguer).
- [ ] Il fournit une **URL** cohérente avec le format Make :
      `https://hook.<région>.make.com/<jeton>` (le jeton peut être masqué par `…`).
- FAIL si l'URL ne suit pas la forme `https://hook.<région>.make.com/<jeton>`, ou si aucune clé API
  n'a été créée. Indice : reprendre l'adresse via *Copy address to clipboard* + section
  *API Key Authentication → Add API Key*.

## Étape 4 — Webhook branché et image reçue (vérification bout en bout)
Nature : **observable** — la Loop teste concrètement l'arrivée de l'image dans Make.
- [ ] Le raccourci se termine par **Get Contents of URL** : **POST**, header **`x-make-apikey`**
      (nom exact) = la clé, **Request Body = File**, **File = Combined Image**.
- [ ] L'apprenant rapporte que le webhook Make a **reçu le POST** (statut accepté, **pas** d'erreur
      d'auth 401 / clé invalide).
- [ ] Il rapporte que Make a **reçu l'image combinée** (structure de données *déterminée* / fichier
      image visible dans l'exécution ; idéalement le header `x-make-apikey` est présent).
- FAIL si rien n'est reçu côté Make, en cas d'erreur d'authentification, ou si la « preuve » est
  manifestement inventée. Indice : vérifier l'URL, le **nom exact** du header `x-make-apikey` et sa
  valeur, `Request Body = File`, et que Make est bien en **Run once** au moment du test.

## Étape 5 — Module IA (extraction structurée)
Nature : **observable** — l'IA doit réellement renvoyer les champs.
- [ ] Un module **Make AI Agents › Run an agent** est ajouté après le webhook, avec une **connexion
      AI provider** et un **Response format = Data structure**.
- [ ] La **Response structure** contient bien les **4 champs** `Prénom`, `Nom`, `LinkedInURL`, `Role`.
- [ ] Le **fichier d'entrée** (Input files → Data) est mappé sur la **sortie du webhook** (`1. value`).
- [ ] Test réel (*Run this module only* ou exécution) : l'IA renvoie un **`jsonResponse`** avec les 4
      champs **remplis** de valeurs plausibles issues de l'image.
- FAIL si le format n'est pas *Data structure*, si un champ manque, si l'image n'est pas mappée, ou
  si l'IA ne renvoie rien / des valeurs manifestement incohérentes. Indice : vérifier le mapping du
  fichier (`1. value`) et les 4 champs de la Response structure.

## Étape 6 — Google Sheet « Prospections » prêt
Nature : déclarative.
- [ ] Une feuille **Google Sheets** nommée **`Prospections`** existe (onglet `Sheet1`).
- [ ] La **ligne 1** contient les **en-têtes** A→D : `Prénom`, `Nom`, `LinkedIn URL`, `Role`
      (bon ordre).
- FAIL si le fichier/onglet n'existe pas ou si les en-têtes manquent / sont dans le désordre.
  Indice : 4 colonnes A→D = Prénom, Nom, LinkedIn URL, Role, données à partir de la ligne 2.

## Étape 7 — Module Google Sheets « Add a Row » + mapping
Nature : déclarative + contrôle du mapping.
- [ ] Un module **Google Sheets › Add a Row** est ajouté après l'IA, connecté au bon compte Google.
- [ ] Il pointe le fichier **`Prospections`** / **`Sheet1`**, *Table contains headers = Yes*.
- [ ] Les **4 colonnes A→D** sont mappées sur la sortie de l'IA :
      `jsonResponse.Prénom / Nom / LinkedInURL / Role`.
- FAIL si le fichier/onglet est faux, si le mapping ne pointe pas la sortie de l'IA, ou si des
  colonnes sont vides/décalées. Indice : mapper A→D sur les champs `jsonResponse` de l'agent IA.

## Étape 8 — Workflow complet testé (vérification bout en bout)
Nature : **observable** — c'est la preuve finale que toute la chaîne fonctionne.
- [ ] Une exécution réelle (Run once + lancement du raccourci) fait passer les **3 modules** au vert
      (Webhook → IA → Google Sheets), sans erreur.
- [ ] Une **nouvelle ligne** apparaît dans `Prospections` avec `Prénom`, `Nom`, `LinkedIn URL`,
      `Role` **cohérents** avec le contact capturé.
- FAIL si un module échoue, si aucune ligne n'est ajoutée, ou si la ligne est vide / mal remplie /
  manifestement inventée. Indice : rejouer chaque module en erreur, vérifier le mapping (étape 7) et
  la sortie IA (étape 5).
