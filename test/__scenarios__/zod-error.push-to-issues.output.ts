import { z } from "zod/v4";

export function parseAndReport(schema: z.ZodJSONSchema, input: unknown) {
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
  }

  return result;
}
