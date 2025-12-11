import { type CollectionEntry } from "astro:content";
import { z } from "astro/zod";

export const schema = z.object({
  email: z.email(),
});

export type Test = CollectionEntry;
