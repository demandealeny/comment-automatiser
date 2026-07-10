# Étape 4 — Créer le premier parent (Webhook → CallSubscenario)

## Objectif
Créer un **premier scénario parent** : un webhook reçoit une requête, puis **appelle** le template
via **Call a subscenario** en mappant les 3 champs d'entrée.

## Marche à suivre
1. Crée un **nouveau scénario** dans Make, par exemple :
   ```
   [mon-compte] Parent A - Webhook Journal
   ```
2. Ajoute un premier module : **Webhooks** → **Custom webhook**.
   - Crée un nouveau webhook et donne-lui un nom (ex. `Journal Parent A`).
3. Ajoute un second module : **Scenarios** → **Call a subscenario**.
4. Configure **Call a subscenario** :
   - **Scenario** : sélectionne ton template `[mon-compte] Template - Journaliser` (créé aux
     étapes 2–3).
   - **Wait for the scenario to finish** : **Yes** (important — le parent attend la fin de
     l'enfant avant de continuer).
   - **Scenario Inputs** (`data`) — mappe les 3 champs :

     | Champ template | Valeur mappée (exemple) |
     |----------------|-------------------------|
     | `nom_projet` | `projet-alpha` (valeur fixe pour ce parent) |
     | `type_evenement` | `webhook` |
     | `detail` | `{{1.` puis choisis un champ du webhook, ou une valeur fixe de test |

     Pour ce premier parent, des **valeurs fixes** suffisent (ex. `projet-alpha`, `webhook`,
     `test depuis parent A`). L'objectif est de maîtriser le mapping.

5. **Sauvegarde** le scénario. Tu peux le laisser inactif pour l'instant — on testera à l'étape 6.

## Quand c'est fait
Réponds « **fait** » en me donnant :
- le **nom** de ton scénario parent,
- confirmation que **Call a subscenario** pointe bien vers ton template,
- que **Wait for the scenario to finish** est sur **Yes**,
- et les **3 valeurs** (ou mappings) que tu as assignées à `nom_projet`, `type_evenement` et
  `detail`.

> ⏭️ À l'étape suivante, tu créeras un **second parent** avec un autre déclencheur — preuve que le
> même template sert à plusieurs endroits.
