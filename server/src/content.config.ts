import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Métadonnées d'un tutoriel : un YAML par tuto (id = nom de fichier).
// Le schéma Zod remplace la validation manuelle de l'ancien tuto.json.
const tutoriels = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/tutoriels" }),
  schema: z.object({
    titre: z.string(),
    niveau: z.string(),
    acces: z.enum(["gratuit", "payant"]),
  }),
});

// Contenu des étapes : un markdown par étape, id = "<tuto>/NN". entry.body = markdown brut.
const etapes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/etapes" }),
});

// Critères de vérification PASS/FAIL par étape, même arborescence que `etapes`.
const rubriques = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/rubriques" }),
});

export const collections = { tutoriels, etapes, rubriques };
