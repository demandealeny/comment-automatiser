// Droits d'accès (entitlement) — POINT D'EXTENSION UNIQUE.
//
// Objectif 2 du projet : tutoriels gratuits vs payants. Les tutoriels marqués
// `acces: "gratuit"` sont toujours ouverts ; les `acces: "payant"` exigent que
// l'identité (ici : une clé de licence) ait le droit correspondant.
//
// MVP (Choix A1) : la clé est transmise par header HTTP et mappée vers un
// ensemble d'ids débloqués. Toute la logique « identité → droits » est isolée
// ici pour pouvoir basculer vers OAuth (A2) plus tard SANS toucher au reste du
// serveur ni au plugin : il suffira de réimplémenter `resoudreDroits`.
//
// Configuration des clés (Cloudflare : variable/secret `CLES_JSON`) :
//   {
//     "cle-demo-123":      ["*"],                 // débloque tout (démo / toi)
//     "cle-client-abcdef": ["make-subscenario"],  // un tuto précis
//     "cle-pack-pro":      ["linkedin-crm", "make-subscenario"]
//   }
// La valeur "*" dans la liste débloque TOUS les tutoriels payants.

const TOUT = "*";

// Clé de démonstration intégrée (débloque tout) pour tester en local sans config.
// À N'UTILISER qu'en dev : en production, définir `CLES_JSON` et retirer ce défaut
// via la variable d'env `CLE_DEMO=off`.
const CLE_DEMO = "cle-demo-tuto";

function parseCles(env) {
  const raw = env && env.CLES_JSON;
  if (!raw) return {};
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

/**
 * Résout les droits d'une identité.
 * @param {string|null|undefined} cle  clé de licence transmise par l'apprenant
 * @param {object} env                 variables d'environnement (CLES_JSON, CLE_DEMO)
 * @returns {{ tout: boolean, ids: Set<string> }}
 *   - tout : true si la clé débloque l'ensemble des tutoriels payants
 *   - ids  : ensemble d'ids explicitement débloqués
 */
export function resoudreDroits(cle, env = {}) {
  const vide = { tout: false, ids: new Set() };
  if (!cle) return vide;

  const table = parseCles(env);
  if (env.CLE_DEMO !== "off" && cle === CLE_DEMO) {
    return { tout: true, ids: new Set() };
  }

  const droits = table[cle];
  if (!droits) return vide;

  const liste = Array.isArray(droits) ? droits : [droits];
  if (liste.includes(TOUT)) return { tout: true, ids: new Set() };
  return { tout: false, ids: new Set(liste) };
}

/**
 * L'apprenant a-t-il accès à ce tutoriel ?
 * Gratuit → toujours. Payant → selon les droits de la clé.
 * @param {{acces:string, id:string}} tuto
 * @param {ReturnType<typeof resoudreDroits>} droits
 */
export function aAcces(tuto, droits) {
  if (!tuto) return false;
  if (tuto.acces === "gratuit") return true;
  return droits.tout || droits.ids.has(tuto.id);
}
