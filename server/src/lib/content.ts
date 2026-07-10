// Accès au contenu des tutoriels, adossé aux Content Collections Astro.
// `entry.body` = markdown brut (exactement ce qu'on renvoie à Claude).

import { getCollection, getEntry } from "astro:content";

export type TutoMeta = {
  id: string;
  titre: string;
  niveau: string;
  acces: "gratuit" | "payant";
  nbEtapes: number;
};

const cle = (id: string, n: number) => `${id}/${String(n).padStart(2, "0")}`;

// nbEtapes dérivé du nombre d'entrées `etapes` du tuto (préfixe "<id>/").
async function compterEtapes(id: string): Promise<number> {
  const all = await getCollection("etapes", (e) => e.id.startsWith(`${id}/`));
  return all.length;
}

function toMeta(id: string, data: { titre: string; niveau: string; acces: "gratuit" | "payant" }, nb: number): TutoMeta {
  return { id, titre: data.titre, niveau: data.niveau, acces: data.acces, nbEtapes: nb };
}

export async function listerTutoriels(): Promise<TutoMeta[]> {
  const tutos = await getCollection("tutoriels");
  const metas = await Promise.all(
    tutos.map(async (t) => toMeta(t.id, t.data, await compterEtapes(t.id)))
  );
  return metas.sort((a, b) => a.id.localeCompare(b.id));
}

export async function getTutoMeta(id: string): Promise<TutoMeta | undefined> {
  const t = await getEntry("tutoriels", id);
  if (!t) return undefined;
  return toMeta(id, t.data, await compterEtapes(id));
}

export async function getEtape(id: string, n: number): Promise<string | undefined> {
  const e = await getEntry("etapes", cle(id, n));
  return e?.body;
}

export async function getRubrique(id: string, n: number): Promise<string | undefined> {
  const r = await getEntry("rubriques", cle(id, n));
  return r?.body;
}

export async function tutoExiste(id: string): Promise<boolean> {
  return Boolean(await getEntry("tutoriels", id));
}
