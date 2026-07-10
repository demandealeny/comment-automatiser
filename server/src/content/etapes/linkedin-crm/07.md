# Étape 7 — Ajoute le module « Google Sheets › Add a Row » et mappe les champs

## Objectif
Brancher le **CRM** : après le module IA, ajouter **Google Sheets › Add a Row** et **mapper** les 4
champs extraits par l'IA sur les colonnes de ta feuille `Prospections`.

## Marche à suivre
1. Après le module **IA**, ajoute un module **Google Sheets** → **Add a Row**.
2. **Connection** : connecte ton compte **Google** (celui qui a accès à `Prospections`).
3. **Search Method** : *Select from the list* (choisir le fichier dans ton Drive).
4. **Drive** : *My Drive* → **Spreadsheet** : `Prospections` → **Sheet** : `Sheet1`.
5. **Table contains headers** : **Yes**.
6. **Values** — mappe chaque colonne sur la sortie de l'agent IA (module `11`, champ `jsonResponse`) :
   - **A – Prénom** : `{{11.jsonResponse.Prénom}}`
   - **B – Nom** : `{{11.jsonResponse.Nom}}`
   - **C – LinkedIn URL** : `{{11.jsonResponse.LinkedInURL}}`
   - **D – Role** : `{{11.jsonResponse.Role}}`

> 💡 Note : Make entoure automatiquement de **backticks** les noms de champ accentués — tu verras
> donc `` {{11.jsonResponse.`Prénom`}} ``. C'est normal et correct.
>
> Le numéro du module IA peut différer de `11` chez toi : sélectionne simplement les champs proposés
> sous **AI Agents › jsonResponse** dans le mappeur.

## Quand c'est fait
Réponds « **fait** » en me confirmant : module **Add a Row** ajouté, fichier `Prospections` / `Sheet1`
sélectionné, *Table contains headers = Yes*, et les **4 colonnes (A→D)** mappées sur
`jsonResponse.Prénom / Nom / LinkedInURL / Role`.
