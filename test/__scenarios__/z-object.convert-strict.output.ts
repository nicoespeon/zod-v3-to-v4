import { z } from "zod/v4";

z.strictObject({ name: z.string() });
z.strictObject({ name: z.string() }).describe("Some Object Schema");

// Nested
z.strictObject({
  name: z.string(),
  address: z.strictObject({
    street: z.string(),
    city: z.string(),
    zip: z.string(),
  }),
});
