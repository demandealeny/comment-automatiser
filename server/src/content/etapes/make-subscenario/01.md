# Étape 1 — Comprendre le pattern parent/enfant

## Objectif
Comprendre **pourquoi** et **comment** un scénario Make peut en appeler un autre pour éviter de dupliquer
la même logique partout.

## Pourquoi
Imagine que tu gères plusieurs projets et que chaque
release GitHub doit déclencher **la même chaîne** : récupérer les assets, les zipper, les déposer
sur Drive. Copier-coller cette logique dans chaque scénario serait un **cauchemar de maintenance** :
un bug à corriger = N scénarios à mettre à jour.

La solution Make : **isoler** la logique réutilisable dans un scénario **enfant** (template), puis
l'**appeler** depuis un ou plusieurs scénarios **parents** avec des paramètres différents.

## Les deux modules clés

| Rôle | Module Make (menu) | Rôle technique |
|------|-------------------|----------------|
| **Enfant (template)** | **Scenarios > Start a subscenario** | Définit l'**interface d'entrée** : quels paramètres le parent doit fournir |
| **Parent (appelant)** | **Scenarios > Call a subscenario** | **Appelle** le template et **mappe** les valeurs dans le champ `data` |

Exemple réel (blueprints de référence) :
- **Template** `[leny.media] Template - Create Zip Plugin` — enfant avec 4 entrées :
  `github_repository_name`, `plugin_zip_name`, `drive_folder_id`, `github_tag_name`
- **Parent A** `[substackos] Create Zip Plugin` — déclencheur GitHub Release → appelle le template
  avec les params substackos
- **Parent B** `[comment-systematiser] Create Zip Plugin` — même template, params différents

Dans ce tutoriel, tu construiras un exemple **plus simple** (journalisation via webhook.site), mais
le **pattern** est identique.

## Marche à suivre
1. Relis le tableau ci-dessus et retiens les **deux noms de modules** Make.
2. Réfléchis à une situation où **tu** aurais intérêt à isoler une logique (même traitement,
   déclencheurs différents).
3. Note mentalement : le parent ne fait que **déclencher + passer des params** ; l'enfant fait le
   **travail réutilisable**.

## Quand c'est fait
Réponds « **fait** » en me donnant :
- les **deux noms de modules** Make (Start / Call subscenario),
- et **en une phrase** pourquoi isoler la logique dans un scénario enfant plutôt que la dupliquer.

> 💡 Astuce : pense « fonction réutilisable » — le template, c'est la fonction ; le parent, c'est
> l'appel avec des arguments différents.
