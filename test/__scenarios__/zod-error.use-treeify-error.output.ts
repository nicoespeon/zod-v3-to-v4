import { z } from "zod/v4";

export function parseAndReport(schema: z.ZodJSONSchema, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const formatted = z.treeifyError(result.error);
    console.error(formatted);

    const flattened = z.treeifyError(result.error);
    console.error(flattened);
  }

  return result;
}
