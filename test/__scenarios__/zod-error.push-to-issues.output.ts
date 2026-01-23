import { z } from "zod/v4";

export function parseAndReport<T>(schema: z.ZodType<T>, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    result.error.issues.push({
      message: "Oh no!",
      code: "custom",
      path: ["foo", "bar"],
      input: "",
    });

    result.error.issues.push(
      {
        message: "Way too big",
        code: "too_big",
        path: ["value"],
        maximum: 10,
        inclusive: true,
        origin: "number",
        input: "",
      },
      {
        message: "Way too small",
        code: "too_small",
        path: ["value"],
        minimum: 1,
        inclusive: true,
        origin: "number",
        input: "",
      },
    );

    console.error({
      message: "Invalid parameters",
      errors: result.error.issues,
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
      code: "custom",
      message: phoneValidation.error.issues[0]?.message,
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
