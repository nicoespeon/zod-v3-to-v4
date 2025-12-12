import { z as zod } from "astro/zod";

export const schema = zod.object({
  email: zod.email(),
});
