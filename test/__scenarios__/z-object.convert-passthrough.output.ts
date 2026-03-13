import { z } from "zod/v4";

z.looseObject({ name: z.string() });

// Inner z.object() without .passthrough() should stay as z.object()
export const schema = z.looseObject({
  links: z
    .array(
      z.object({
        targetId: z.string(),
        text: z.string(),
      }),
    )
    .default([]),
});
