import { type CollectionEntry, z } from "astro:content";

export const schema = z.object({
  email: z.string().email(),
});

export type Test = CollectionEntry;
