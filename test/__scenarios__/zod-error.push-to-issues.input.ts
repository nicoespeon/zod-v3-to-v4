import { z } from "zod";

export function parseAndReport(schema: z.ZodSchema, input: unknown) {
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
  }

  return result;
}
