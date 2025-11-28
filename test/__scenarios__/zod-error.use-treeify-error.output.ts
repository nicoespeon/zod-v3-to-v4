import { z } from "zod/v4";

export function parseAndReport(schema: z.ZodType, input: unknown) {
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
      errors: z.treeifyError(validatedFields.error),
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
