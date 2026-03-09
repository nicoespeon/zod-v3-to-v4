import { z } from "zod";

export function parseAndReport(schema: z.ZodSchema, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const formatted = result.error.format();
    console.error(formatted);
  }

  return result;
}

export function format(error: z.ZodError) {
  return error.format();
}

// Should not match
export class ShouldNotTransform {
  format() {}

  formatQuantity(unknownQuantity: any) {
    this.format();
    return unknownQuantity.format();
  }
}
