import { z } from "zod/v4";

export function parseAndReport(schema: z.ZodJSONSchema, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const formatted = z.treeifyError(result.error);
    console.error(formatted);

    const flattened = z.treeifyError(result.error);
    console.error(flattened);

    console.error(z.treeifyError(result.error));
  }

  return result;
}

export function format(error: z.ZodError) {
  return z.treeifyError(error);
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
