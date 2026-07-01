# Étape 8 — Teste tout le workflow de bout en bout

## Objectif
Lancer la **chaîne complète** et vérifier qu'un **nouveau contact apparaît dans ton CRM** :
raccourci iPhone → webhook → IA → Google Sheets.

## Marche à suivre
1. Dans Make, clique **Run once** sur le scénario (il attend une requête).
2. Sur l'iPhone, lance le raccourci **From LinkedIn** sur un **vrai profil** : capture du profil,
   alerte → ouvre les *coordonnées*, 2ᵉ capture, fusion, envoi.
3. Regarde le scénario s'exécuter : les **3 modules** doivent passer au **vert** —
   Webhook (image reçue) → IA (`jsonResponse` avec les 4 champs) → Google Sheets (1 ligne ajoutée).
4. Ouvre **Prospections** : une **nouvelle ligne** doit contenir `Prénom`, `Nom`, `LinkedIn URL`,
   `Role` du contact.
5. **(Optionnel — mise en production)** Ferme *Run once*, puis **active** le scénario et règle la
   planification sur **Immediately as data arrives** : chaque envoi du raccourci alimentera
   automatiquement ton CRM.

## Quand c'est fait
Réponds « **fait** » en me rapportant la **preuve de bout en bout** :
- les **3 modules** ont réussi (verts, sans erreur),
- et une **nouvelle ligne** est bien apparue dans `Prospections` avec les infos du contact
  (colle par exemple les valeurs `Prénom / Nom / LinkedIn URL / Role` ajoutées).

Bravo — tu as un pipeline **LinkedIn → CRM** entièrement automatisé ! 🎉
