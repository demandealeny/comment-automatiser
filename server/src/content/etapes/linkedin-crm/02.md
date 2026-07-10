# Étape 2 — Fusionne les deux captures en une seule image

## Objectif
Compléter le raccourci pour **récupérer les 2 dernières photos** (tes 2 captures) et les **combiner
en une seule image**, côte à côte (**horizontalement**).

## Pourquoi
Un webhook Make est plus simple à alimenter avec **un seul fichier**. Fusionner profil + coordonnées
en **une image** te donne un envoi unique, et plus tard l'IA aura tout le contexte d'un seul coup.

## Marche à suivre
À la **suite** des actions de l'étape 1, ajoute :
1. **Obtenir les dernières photos** (*Get Latest Photos*) → règle le nombre sur **2**
   (« Get the latest **2** photos »). Ça récupère tes deux captures les plus récentes.
2. **Combiner les images** (*Combine Images*) :
   - en entrée, les **Latest Photos** (le résultat de l'action précédente),
   - mode **Horizontally** (horizontalement, côte à côte).
   - La sortie est une variable **Combined Image** (Image combinée) — c'est elle qu'on enverra.

Relance le raccourci en entier : après les 2 captures, il doit produire **une seule** image qui
montre **les deux écrans côte à côte**.

## Quand c'est fait
Réponds « **fait** » en confirmant que le raccourci se termine désormais par
`Get Latest Photos (2)` → `Combine Images (Horizontally)`, et que son exécution produit bien **une
seule image combinée** (profil + coordonnées côte à côte).

> 💡 Astuce : pour visualiser le résultat pendant les tests, tu peux ajouter temporairement une
> action *Aperçu rapide* (*Quick Look*) après *Combine Images* — à retirer une fois validé.
