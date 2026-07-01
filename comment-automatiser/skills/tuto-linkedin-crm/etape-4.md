# Étape 4 — Branche le webhook dans le raccourci et teste de bout en bout

## Objectif
Ajouter la dernière action du raccourci pour **envoyer l'image combinée** au webhook Make, puis
**tester toute la chaîne** : lancer le raccourci et **voir Make recevoir l'image**. C'est la preuve
que ton pont iPhone → Make fonctionne.

## Marche à suivre

### A. Ajouter l'envoi dans le raccourci
À la **suite** de `Combine Images` (étape 2), ajoute **Obtenir le contenu de l'URL**
(*Get Contents of URL*) et configure :
- **URL** : ton adresse de webhook (étape 3).
- **Method** : **POST**.
- **Headers** : ajoute un header
  - clé : **`x-make-apikey`** (nom exact),
  - valeur : **ta clé API** (celle créée à l'étape 3).
- **Request Body** : **File** (Fichier).
- **File** : sélectionne la variable **Combined Image** (l'image combinée de l'étape 2).

### B. Mettre Make en écoute
Dans ton scénario Make, clique **Run once** (Exécuter une fois) : le webhook **attend** une requête.

### C. Déclencher et observer
Lance le raccourci **From LinkedIn** sur l'iPhone (LinkedIn s'ouvre, tu fais tes 2 captures via
l'alerte, il combine puis **POST** l'image). Côté Make, le webhook doit **recevoir** la requête et
**déterminer la structure de données** (*Successfully determined*) : tu y vois le **fichier image**
reçu et, dans les détails de l'exécution, le **header `x-make-apikey`**.

Si tu obtiens une **erreur d'authentification** (ex. 401 / clé invalide), c'est que le header
`x-make-apikey` ou sa valeur ne correspond pas à la clé du webhook — corrige et relance.

## Quand c'est fait
Réponds « **fait** » en me rapportant la **preuve de réception** côté Make :
- que le webhook a bien **reçu le POST** (statut accepté, pas d'erreur d'auth),
- et qu'il a **reçu l'image combinée** (structure déterminée / fichier visible dans l'exécution).

Tu peux me coller un extrait de ce que Make affiche (nom/type du fichier reçu, présence du header) —
sans divulguer la clé. 🎉
