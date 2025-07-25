import { z } from "zod/v4";

const AdditionalSchema = z.object({
  email: z.email(),
  phone: z.string().min(10),
});

const ExtendedSchema = z
  .object({
    name: z.string(),
    age: z.number(),
  })
  .extend(AdditionalSchema.shape)
  .optional();
type ExtendedSchema = z.infer<typeof ExtendedSchema>;
