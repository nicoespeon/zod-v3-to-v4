import { z } from "zod";

z.object({ name: z.string() }).passthrough();

// Inner z.object() without .passthrough() should stay as z.object()
export const schema = z
  .object({
    links: z
      .array(
        z.object({
          targetId: z.string(),
          text: z.string(),
        }),
      )
      .default([]),
  })
  .passthrough();
