import { z } from "zod";

export function parseAndReport(schema: z.ZodSchema, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const formatted = result.error.format();
    console.error(formatted);

    const flattened = result.error.flatten();
    console.error(flattened);

    console.error(result.error.formErrors);
  }

  return result;
}

export function format(error: z.ZodError) {
  return error.format();
}

// Should not match
export class ShouldNotTransform {
  format() {}
  formErrors() {}

  formatQuantity(unknownQuantity: any) {
    const errors = this.formErrors();
    this.format();
    unknownQuantity.formErrors.invalidPassword = true;
    return unknownQuantity.format();
  }
}
