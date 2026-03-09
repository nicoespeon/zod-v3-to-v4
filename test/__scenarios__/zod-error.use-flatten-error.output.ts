import { z } from "zod/v4";

export function parseAndReport(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const flattened = z.flattenError(result.error);
    console.error(flattened);

    console.error(z.flattenError(result.error));

    return z.flattenError(result.error).fieldErrors;
  }

  return result;
}

// Should not match
export class ShouldNotTransform {
  flatten() {}
  formErrors() {}

  doStuff(unknownQuantity: any) {
    this.flatten();
    const errors = this.formErrors();
    unknownQuantity.formErrors.invalidPassword = true;
  }
}
