import { z } from "zod";

const NonEmpty = z.array(z.string()).describe("Non-empty array").nonempty();

export const nestedNonEmpty = z.object({
  items: z
    .array(
      z.object({
        left: z.array(z.string()).nonempty(),
      })
    )
    .nonempty(),
});