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

// From Next.js tutorial https://nextjs.org/learn/dashboard-app/improving-accessibility
const CreateInvoice = z.object({
  customerId: z.string(),
  amount: z.number(),
  status: z.enum(["pending", "paid", "cancelled"]),
});

export async function createInvoice(formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // ...
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
