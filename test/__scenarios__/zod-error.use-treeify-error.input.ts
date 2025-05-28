import { z } from "zod";

export function parseAndReport(schema: z.ZodSchema, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const formatted = result.error.format();
    console.error(formatted);

    const flattened = result.error.flatten();
    console.error(flattened);
  }

  return result;
}
