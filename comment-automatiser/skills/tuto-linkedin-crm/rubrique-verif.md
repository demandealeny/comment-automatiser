# Rubrique de vérification — tuto « linkedin-crm » (Partie 1)

Critères que le `verificateur` applique à chaque étape. Verdict `PASS` seulement si **tous** les
critères de l'étape sont satisfaits, sur la base des **preuves rapportées** par l'apprenant (les
artefacts vivent sur l'iPhone et dans Make, non inspectables directement — voir le contexte de
vérification du SKILL).

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
Nature : **observable** — c'est ici que la Loop teste concrètement la chaîne complète.
- [ ] Le raccourci se termine par **Get Contents of URL** : **POST**, header **`x-make-apikey`**
      (nom exact) = la clé, **Request Body = File**, **File = Combined Image**.
- [ ] L'apprenant rapporte que le webhook Make a **reçu le POST** (statut accepté, **pas** d'erreur
      d'auth 401 / clé invalide).
- [ ] Il rapporte que Make a **reçu l'image combinée** (structure de données *déterminée* / fichier
      image visible dans l'exécution ; idéalement le header `x-make-apikey` est présent).
- FAIL si rien n'est reçu côté Make, en cas d'erreur d'authentification, ou si la « preuve » est
  manifestement inventée/incohérente (ex. pas de fichier, header absent). Indice : vérifier l'URL,
  le **nom exact** du header `x-make-apikey` et sa valeur, `Request Body = File`, et que Make est
  bien en **Run once** au moment du test.
