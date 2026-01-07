import { z } from "zod";

z.object({ name: z.string() }).strict();
z.object({ name: z.string() }).describe("Some Object Schema").strict();

// Nested
z.object({
  name: z.string(),
  address: z
    .object({
      street: z.string(),
      city: z.string(),
      zip: z.string(),
    })
    .strict(),
}).strict();

// With parent schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const schema = z.object({
  foo: UserSchema.pick({ id: true }).strict()
})