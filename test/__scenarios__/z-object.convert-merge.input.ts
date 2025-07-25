import { z } from "zod";

const AdditionalSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
});

const ExtendedSchema = z
  .object({
    name: z.string(),
    age: z.number(),
  })
  .merge(AdditionalSchema)
  .optional();
type ExtendedSchema = z.infer<typeof ExtendedSchema>;
