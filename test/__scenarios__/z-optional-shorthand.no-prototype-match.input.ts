import { z } from "zod";

const schema = z.object({
  lat: z
    .number()
    .transform((val) => val.toString())
    .optional(),
  long: z
    .number()
    .transform((val) => val.toString())
    .optional(),
});
