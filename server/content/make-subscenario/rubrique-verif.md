# Rubrique de vérification — tuto « make-subscenario »

Critères que le `verificateur` applique à chaque étape. Verdict `PASS` seulement si **tous** les
critères de l'étape sont satisfaits, sur la base des **preuves rapportées** par l'apprenant (les
artefacts vivent dans Make et sur webhook.site, non inspectables directement — voir le contexte
de vérification du SKILL). L'étape **6** exige une **preuve d'exécution réelle** ; les étapes
**1 à 5** sont déclaratives.

## Étape 1 — Comprendre le pattern parent/enfant
Nature : déclarative (conceptuel). Vérification par Q&A ciblé.
- [ ] L'apprenant nomme les **deux modules** Make : **Start a subscenario** (enfant) et
      **Call a subscenario** (parent) — formulations proches acceptées.
- [ ] Il explique **en une phrase** pourquoi isoler la logique (éviter duplication, maintenance,
      réutilisabilité, un seul endroit à corriger…).
- FAIL si un module manque, si les rôles sont inversés, ou si la justification est absente/vague.
  Indice : rappeler le tableau enfant = interface, parent = appel + mapping `data`.

## Étape 2 — Scénario enfant avec StartSubscenario
Nature : déclarative.
- [ ] L'apprenant donne le **nom** de son scénario template (contient une indication de template
      ou de journalisation — pas obligatoire mais le nom doit être explicite).
- [ ] Il liste les **3 champs** d'entrée : `nom_projet`, `type_evenement`, `detail` (noms exacts
      ou équivalents sémantiques clairs).
- FAIL si moins de 3 champs, si Start a subscenario n'est pas mentionné, ou si le scénario n'est
  pas créé. Indice : Scenarios → Start a subscenario → Scenario Inputs.

## Étape 3 — Logique réutilisable dans l'enfant
Nature : déclarative.
- [ ] Le scénario template est **actif** (ON).
- [ ] L'apprenant confirme **2 modules** après Start : **Set variable** (ou équivalent) et
      **HTTP Make a request** (POST).
- [ ] Le body JSON contient au minimum les clés `nom_projet`, `type_evenement`, `detail` et une
      clé formatée (`ligne_journal` ou équivalent).
- FAIL si le scénario n'est pas actif, si HTTP POST manque, ou si le mapping JSON est absent.
  Indice : Set variable pour formater, HTTP POST vers webhook.site, activer le scénario.

## Étape 4 — Premier parent (Webhook → CallSubscenario)
Nature : déclarative + contrôle du mapping.
- [ ] L'apprenant nomme son **scénario parent A**.
- [ ] **Call a subscenario** pointe vers le **template** créé aux étapes 2–3 (même nom ou
      confirmation explicite).
- [ ] **Wait for the scenario to finish** = **Yes**.
- [ ] Les **3 champs** `nom_projet`, `type_evenement`, `detail` sont **mappés** (valeurs fixes ou
      variables — pas laissés vides).
- FAIL si Call a subscenario absent, si Wait = No, si un champ est vide, ou si le mauvais template
  est sélectionné. Indice : Webhook → Call a subscenario → mapper `data`.

## Étape 5 — Second parent (réutilisation)
Nature : déclarative.
- [ ] L'apprenant nomme son **scénario parent B** (distinct du parent A).
- [ ] Le **déclencheur** est **différent** du webhook du parent A (Schedule on-demand, Run once,
      Set variable, etc.).
- [ ] Le **`nom_projet`** mappé est **différent** de celui du parent A.
- [ ] Les **deux parents** appellent le **même** template enfant.
- FAIL si même nom_projet que parent A, si même scénario que parent A, ou si un second parent
  n'existe pas. Indice : deux parents légers, un seul template, params différents.

## Étape 6 — Test bout en bout
Nature : **observable** — la Loop teste concrètement les exécutions.
- [ ] **Parent A** exécuté avec statut **Success** (rapporté par l'apprenant).
- [ ] **Parent B** exécuté avec statut **Success**.
- [ ] Le scénario **enfant** a tourné **au moins 2 fois** (via historique Make ou exécutions
      liées au Call a subscenario).
- [ ] **webhook.site** (ou équivalent) a reçu **2 payloads** avec des valeurs **`nom_projet`
      distinctes** — l'apprenant fournit un extrait JSON ou décrit les deux valeurs différentes
      de façon cohérente et difficile à inventer.
- FAIL si une exécution a échoué, si un seul payload est rapporté, si les `nom_projet` sont
  identiques, ou si la « preuve » est manifestement vague/inventée. Indice : Run once sur chaque
  parent, vérifier historique Make + onglet webhook.site.
