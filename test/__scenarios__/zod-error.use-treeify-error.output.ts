import { z } from "zod/v4";

export function parseAndReport(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const formatted = z.treeifyError(result.error);
    console.error(formatted);
  }

  return result;
}

export function format(error: z.ZodError) {
  return z.treeifyError(error);
}

// Should not match
export class ShouldNotTransform {
  format() {}

  formatQuantity(unknownQuantity: any) {
    this.format();
    return unknownQuantity.format();
  }
}
