# Étape 3 — Construire la logique réutilisable dans l'enfant

## Objectif
Compléter le scénario template avec la **logique réutilisable** : formater un message et l'envoyer
via HTTP POST vers une URL de test. Puis **activer** le scénario enfant.

## Marche à suivre

### A. Préparer une URL de réception (webhook.site)
1. Ouvre [webhook.site](https://webhook.site) dans ton navigateur.
2. Une **URL unique** t'est assignée automatiquement (ex. `https://webhook.site/abc123…`).
3. **Copie cette URL** — tu en auras besoin pour le module HTTP. Garde l'onglet ouvert pour voir
   les requêtes arriver à l'étape 6.

### B. Ajouter Set variable
Après **Start a subscenario**, ajoute **Tools** → **Set variable** :
- **Variable name** : `ligne_journal`
- **Variable lifetime** : **One cycle** (roundtrip)
- **Variable value** : compose le texte à partir des entrées du subscenario, par exemple :
  ```
  {{2.nom_projet}} — {{2.type_evenement}} : {{2.detail}}
  ```
  (Le numéro `2` correspond à l'ID du module Start a subscenario — adapte si Make t'affiche un
  autre numéro dans le sélecteur de variables.)

### C. Ajouter HTTP Make a request
Ajoute **HTTP** → **Make a request** :
- **URL** : ton URL webhook.site (collée telle quelle).
- **Method** : **POST**
- **Body type** : **Raw**
- **Content type** : **JSON (application/json)**
- **Request content** : un JSON qui reprend les 3 champs + la ligne formatée, par exemple :
  ```json
  {
    "nom_projet": "{{2.nom_projet}}",
    "type_evenement": "{{2.type_evenement}}",
    "detail": "{{2.detail}}",
    "ligne_journal": "{{3.ligne_journal}}"
  }
  ```
  (Adapte les numéros de modules `2` et `3` selon ton scénario.)

### D. Activer le scénario enfant
1. **Sauvegarde** le scénario.
2. **Active-le** (interrupteur ON). Un scénario enfant appelé par un parent doit être **actif**.

## Sécurité 🔐
L'URL webhook.site est **unique et publique** : ne la colle pas dans un fichier git versionné. Tu
peux me la donner **masquée** (`https://webhook.site/abc…`) quand tu me fais un rapport.

## Quand c'est fait
Réponds « **fait** » en me confirmant :
- que le scénario template est **actif** (ON),
- les **2 modules** ajoutés après Start (Set variable + HTTP POST),
- et le **format** du body JSON (les 4 clés envoyées).

> 💡 Astuce : tu peux tester le template seul en cliquant **Run once** sur Start a subscenario et
> en saisissant des valeurs de test — tu devrais voir le POST apparaître sur webhook.site.
