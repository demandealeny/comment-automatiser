#!/usr/bin/env node
// Génère un bundle de contenu portable (Node ET Cloudflare Workers) à partir des
// dossiers `content/<id>/` (markdown + manifeste `tuto.json`).
//
// Sortie : `src/generated/content.js` → `export const tutorials = { ... }`.
// Aucune dépendance externe. Relancer après chaque ajout/modif de contenu :
//   npm run build:content
//
// Un tutoriel = un dossier `content/<id>/` :
//   - tuto.json          { id, titre, niveau, acces: "gratuit"|"payant", nbEtapes }
//   - etape-1.md … etape-N.md   (contenu présenté à l'apprenant)
//   - rubrique-verif.md  (critères PASS/FAIL, découpés par « ## Étape N » )

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, "..", "content");
const outFile = join(__dirname, "..", "src", "generated", "content.js");

// Découpe une rubrique en sections par étape via les titres « ## Étape N … ».
// Renvoie { "1": "…", "2": "…" }. Si aucun titre ne matche, renvoie {} (repli
// géré à l'exécution : on sert la rubrique entière).
function splitRubrique(md) {
  const sections = {};
  const re = /^##\s+Étape\s+(\d+)\b[^\n]*$/gim;
  const marks = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    marks.push({ n: m[1], start: m.index });
  }
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].start;
    const end = i + 1 < marks.length ? marks[i + 1].start : md.length;
    sections[marks[i].n] = md.slice(start, end).trim();
  }
  return sections;
}

function buildTutorial(id) {
  const dir = join(contentDir, id);
  const manifest = JSON.parse(readFileSync(join(dir, "tuto.json"), "utf8"));

  const etapes = {};
  const files = readdirSync(dir)
    .filter((f) => /^etape-(\d+)\.md$/.test(f))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  for (const f of files) {
    const n = Number(f.match(/^etape-(\d+)\.md$/)[1]);
    etapes[n] = readFileSync(join(dir, f), "utf8").trim();
  }

  const nbEtapes = files.length;
  if (manifest.nbEtapes && manifest.nbEtapes !== nbEtapes) {
    throw new Error(
      `Incohérence pour ${id} : tuto.json indique ${manifest.nbEtapes} étapes mais ` +
        `${nbEtapes} fichiers etape-*.md trouvés.`
    );
  }

  const rubriqueBrute = readFileSync(join(dir, "rubrique-verif.md"), "utf8").trim();
  const rubriques = splitRubrique(rubriqueBrute);

  return {
    id: manifest.id,
    titre: manifest.titre,
    niveau: manifest.niveau,
    acces: manifest.acces,
    nbEtapes,
    etapes,
    rubriqueBrute,
    rubriques,
  };
}

const ids = readdirSync(contentDir).filter((f) =>
  statSync(join(contentDir, f)).isDirectory()
);

const tutorials = {};
for (const id of ids.sort()) {
  tutorials[id] = buildTutorial(id);
}

const banner =
  "// FICHIER GÉNÉRÉ — ne pas éditer à la main.\n" +
  "// Source : server/content/<id>/ (voir scripts/build-content.mjs).\n";
const body = `export const tutorials = ${JSON.stringify(tutorials, null, 2)};\n`;
writeFileSync(outFile, banner + body, "utf8");

console.log(
  `OK — ${ids.length} tutoriel(s) écrit(s) dans src/generated/content.js : ${ids.join(", ")}`
);
