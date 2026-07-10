# Étape 5 — Créer un second parent (réutilisation)

## Objectif
Prouver la **réutilisabilité** du template : créer un **deuxième scénario parent** avec un
**autre déclencheur** et un **`nom_projet` différent**, qui appelle le **même** scénario enfant.

C'est exactement le principe des blueprints `[substackos]` et `[comment-systematiser]` : deux
parents, un template, des paramètres différents.

## Marche à suivre
1. Crée un **nouveau scénario**, par exemple :
   ```
   [mon-compte] Parent B - Planif Journal
   ```
2. Choisis un **déclencheur différent** du Parent A. Deux options simples :
   - **Basics** → **Schedule** → planification **On demand** (à la demande) — tu l'exécuteras
     manuellement à l'étape 6 ;
   - ou **Tools** → **Set variable** en tout premier module (scénario déclenché via **Run once**).
3. Ajoute **Scenarios** → **Call a subscenario** :
   - **Scenario** : le **même** template `[mon-compte] Template - Journaliser`.
   - **Wait for the scenario to finish** : **Yes**.
   - **Scenario Inputs** — mappe avec un **`nom_projet` différent** de celui du Parent A :

     | Champ template | Valeur (exemple Parent B) |
     |----------------|---------------------------|
     | `nom_projet` | `projet-beta` (≠ `projet-alpha` du Parent A) |
     | `type_evenement` | `planif` ou `manuel` |
     | `detail` | `test depuis parent B` |

4. **Sauvegarde** le scénario.

## Quand c'est fait
Réponds « **fait** » en me donnant :
- le **nom** du second parent,
- le **type de déclencheur** choisi (Schedule on-demand, Run once, etc.),
- le **`nom_projet`** mappé (doit être **différent** de celui du Parent A),
- et confirmation que les **deux parents** appellent le **même** template.

> 💡 Astuce : si tu avais 10 projets, tu créerais 10 parents légers — et **un seul** template à
> maintenir.
