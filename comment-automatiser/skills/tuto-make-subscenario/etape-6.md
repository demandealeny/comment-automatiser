# Étape 6 — Test bout en bout

## Objectif
Exécuter **les deux parents**, vérifier que le scénario **enfant** a tourné **deux fois** avec des
inputs **distincts**, et que webhook.site a reçu **deux payloads** différents.

## Marche à suivre

### A. Exécuter le Parent A (Webhook)
1. Ouvre le scénario **Parent A - Webhook Journal**.
2. Clique **Run once** — le webhook **attend** une requête.
3. Envoie une requête POST vers l'URL du webhook (depuis un navigateur avec une extension, curl,
   ou **HTTP > Make a request** dans un scénario de test). Un simple POST vide suffit si tes champs
   sont en valeurs fixes.
4. Vérifie dans l'**historique d'exécution** Make :
   - Parent A : statut **Success**
   - Enfant (template) : une exécution déclenchée par Call a subscenario — **Success**

### B. Exécuter le Parent B
1. Ouvre le scénario **Parent B - Planif Journal**.
2. Clique **Run once** (ou déclenche selon ton planificateur).
3. Vérifie à nouveau l'historique : Parent B **Success**, enfant **Success**.

### C. Vérifier webhook.site
1. Retourne sur ton onglet [webhook.site](https://webhook.site).
2. Tu dois voir **au moins 2 requêtes POST** reçues.
3. Compare les payloads : le champ `nom_projet` doit être **différent** entre les deux
   (`projet-alpha` vs `projet-beta`, ou les valeurs que tu as choisies).

## Quand c'est fait
Réponds « **fait** » en me rapportant la **preuve d'exécution** :
- **Parent A** : statut Success (oui/non),
- **Parent B** : statut Success (oui/non),
- **Enfant** : confirmé qu'il a tourné **2 fois** (via l'historique ou les exécutions liées),
- **webhook.site** : extrait des **2 payloads** montrant des `nom_projet` **distincts** (tu peux
  coller le JSON — masque l'URL webhook.site si besoin).

> 🎉 Si tout est vert, tu maîtrises le pattern parent/enfant Make. Tu peux maintenant appliquer
> ce modèle à des flux plus ambitieux (releases GitHub, uploads Drive, notifications…) sans
> dupliquer la logique.
