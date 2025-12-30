import { z } from "zod/v4";

const NonEmpty = z.tuple([z.string()], z.string()).describe("Non-empty array");

export const nestedNonEmpty = z.object({
  items: z.tuple(
    [
      z.object({
        left: z.tuple([z.string()], z.string()),
      }),
    ],
    z.object({
      left: z.tuple([z.string()], z.string()),
    })
  ),
});
