// Droits d'accès (entitlement) — POINT D'EXTENSION UNIQUE.
//
// Tutoriels gratuits vs payants. Les `gratuit` sont toujours ouverts ; les `payant`
// exigent que l'identité (ici : une clé de licence) ait le droit correspondant.
//
// MVP : clé transmise par header HTTP, mappée vers un ensemble d'ids débloqués.
// Toute la logique « identité → droits » est isolée ici pour basculer vers OAuth plus
// tard SANS toucher au reste du serveur ni au plugin : réimplémenter `resoudreDroits`.
//
// Config des clés (secret `CLES_JSON`) :
//   { "cle-demo-123": ["*"], "cle-client-abc": ["make-subscenario"] }
// "*" débloque TOUS les tutoriels payants.

export type Env = { CLES_JSON?: string; BASE_ACHAT_URL?: string; CLE_DEMO?: string };
export type Droits = { tout: boolean; ids: Set<string> };
export type AvecAcces = { id: string; acces: "gratuit" | "payant" };

const TOUT = "*";

// Clé de démo intégrée (débloque tout) pour tester sans config. Désactivable via CLE_DEMO="off".
const CLE_DEMO = "cle-demo-tuto";

function parseCles(env: Env): Record<string, string[] | string> {
  const raw = env?.CLES_JSON;
  if (!raw) return {};
  try {
    const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export function resoudreDroits(cle: string | null | undefined, env: Env = {}): Droits {
  const vide: Droits = { tout: false, ids: new Set() };
  if (!cle) return vide;

  if (env.CLE_DEMO !== "off" && cle === CLE_DEMO) return { tout: true, ids: new Set() };

  const droits = parseCles(env)[cle];
  if (!droits) return vide;

  const liste = Array.isArray(droits) ? droits : [droits];
  if (liste.includes(TOUT)) return { tout: true, ids: new Set() };
  return { tout: false, ids: new Set(liste) };
}

/** Gratuit → toujours. Payant → selon les droits de la clé. */
export function aAcces(tuto: AvecAcces, droits: Droits): boolean {
  if (!tuto) return false;
  if (tuto.acces === "gratuit") return true;
  return droits.tout || droits.ids.has(tuto.id);
}
