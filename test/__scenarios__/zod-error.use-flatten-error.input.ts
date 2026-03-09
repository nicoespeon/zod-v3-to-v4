import { z } from "zod";

export function parseAndReport(schema: z.ZodSchema, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const flattened = result.error.flatten();
    console.error(flattened);

    console.error(result.error.formErrors);

    return result.error.flatten().fieldErrors;
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
