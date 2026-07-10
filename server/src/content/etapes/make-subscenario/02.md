# Étape 2 — Créer le scénario enfant avec StartSubscenario

## Objectif
Créer le scénario **template** (enfant) et y placer le module **Start a subscenario** qui définit
l'interface d'entrée — les paramètres que les parents devront fournir.

## Prérequis
- Compte [Make](https://www.make.com/en/register?pc=demandealeny) (gratuit possible).

## Marche à suivre
1. Connecte-toi à Make et crée un **nouveau scénario**.
2. Donne-lui un nom explicite, par exemple :
   ```
   [mon-compte] Template - Journaliser
   ```
   (Remplace `mon-compte` par un identifiant qui te parle — ton pseudo, ton domaine, etc.)
3. Supprime le module par défaut s'il y en a un, puis ajoute le premier module :
   **Scenarios** → **Start a subscenario**.
4. Dans la configuration de **Start a subscenario**, ajoute **3 champs texte** (Scenario Inputs) :

   | Nom du champ | Type | Description |
   |--------------|------|-------------|
   | `nom_projet` | Text | Identifiant du projet (ex. substackos) |
   | `type_evenement` | Text | Type d'événement (ex. release, deploy) |
   | `detail` | Text | Détail libre (ex. version, message) |

5. **Ne sauvegarde pas encore** la logique complète — on l'ajoute à l'étape 3. Pour l'instant,
   vérifie que les 3 champs apparaissent bien dans l'interface du module.

## Quand c'est fait
Réponds « **fait** » en me donnant :
- le **nom exact** de ton scénario template,
- et la **liste des 3 champs** d'entrée que tu as définis.

> ⏭️ À l'étape suivante, on ajoute la logique réutilisable **après** ce module Start.
