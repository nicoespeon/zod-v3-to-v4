import { z } from "zod";

export function parseAndReport<T>(schema: z.ZodSchema<T>, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    result.error.addIssue({
      message: "Oh no!",
      code: "custom",
      path: ["foo", "bar"],
    });

    result.error.addIssues([
      {
        message: "Way too big",
        code: "too_big",
        path: ["value"],
        maximum: 10,
        inclusive: true,
        type: "number",
      },
      {
        message: "Way too small",
        code: "too_small",
        path: ["value"],
        minimum: 1,
        inclusive: true,
        type: "number",
      },
    ]);

    console.error({
      message: "Invalid parameters",
      errors: result.error.errors,
    });
  }

  return result;
}

z.string().superRefine((phoneNumber, ctx)=> {
  const phoneValidation = z
    .string()
    .length(10, "Should have 10 characters")
    .safeParse(phoneNumber);

  if (!phoneValidation.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: phoneValidation.error.errors[0]?.message,
      path: ["phoneNumber"],
    });
  }
})

// Should not match
export class ShouldNotTransform {
  addIssue(issue: any) {}
  addIssues(issues: any[]) {}

  addQuantityIssue(issue: any, unknownQuantity: any) {
    this.addIssues([issue]);
    this.addIssue(issue);

    unknownQuantity.addIssues.invalidPassword = true;
    return unknownQuantity.addIssue();
  }
}
