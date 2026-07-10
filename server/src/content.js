// Accès au contenu des tutoriels (catalogue, étapes, rubriques).
// Le contenu vient du bundle généré `generated/content.js` — portable Node + Workers.

import { tutorials } from "./generated/content.js";

/** Métadonnées publiques d'un tutoriel (sans le contenu). */
function meta(t) {
  return { id: t.id, titre: t.titre, niveau: t.niveau, acces: t.acces, nbEtapes: t.nbEtapes };
}

/** Catalogue : liste des métadonnées de tous les tutoriels. */
export function listerTutoriels() {
  return Object.values(tutorials).map(meta);
}

/** Un tutoriel par id, ou undefined. */
export function getTuto(id) {
  return tutorials[id];
}

export function getTutoMeta(id) {
  const t = tutorials[id];
  return t ? meta(t) : undefined;
}

/** Contenu de l'étape n (string) ou undefined si absente. */
export function getEtape(id, n) {
  const t = tutorials[id];
  if (!t) return undefined;
  return t.etapes[String(n)];
}

/**
 * Rubrique de vérification de l'étape n.
 * Repli sur la rubrique entière si le découpage par étape n'a rien donné.
 */
export function getRubrique(id, n) {
  const t = tutorials[id];
  if (!t) return undefined;
  const section = t.rubriques[String(n)];
  return section || t.rubriqueBrute;
}
