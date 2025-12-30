import { z } from "zod/v4";

z.string({
  error: (issue) =>
    issue.input === undefined ? "This field is required" : "Not a string",
});

z.string({
  error: (issue) =>
    issue.input === undefined ? "This field is necessary" : undefined,
});

z.string({
  error: (issue) => (issue.input === undefined ? undefined : "Not a number"),
});

z.string({
  error: "This message takes precedence",
});

const password = (requiredMessage: string) =>
  z
    .string({
      error: (issue) =>
        issue.input === undefined ? requiredMessage : undefined,
    })
    .min(12);

z.string()
  .optional()
  .refine((value) => {
    if (!value) {
      const error = {
        code: "MISSING",
        // Should be left untouched
        message: "Value is missing!",
      };
      console.error(error);
    }
  });

export const baseSchema = z.string().refine(value => Number.isFinite(parseFloat(value)), {
  error: 'Input must represent a finite number',
});

export const constrainedSchema = baseSchema.refine(value => parseFloat(value) > 0, {
  error: 'Input must be greater than zero',
});