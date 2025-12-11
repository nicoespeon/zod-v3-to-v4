import { z as zod } from "astro:content";

export const schema = zod.object({
  email: zod.string().email(),
});
