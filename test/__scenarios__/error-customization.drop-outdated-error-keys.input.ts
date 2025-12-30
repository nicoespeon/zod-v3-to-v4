import { z } from "zod";

z.string({
  required_error: "This field is required",
  invalid_type_error: "Not a string",
});

z.string({
  required_error: "This field is necessary",
});

z.string({
  invalid_type_error: "Not a number",
});

z.string({
  required_error: "This field is required",
  invalid_type_error: "Not a string",
  message: "This message takes precedence",
});

const password = (requiredMessage: string) =>
  z.string({ required_error: requiredMessage }).min(12);

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
  message: 'Input must represent a finite number',
});

export const constrainedSchema = baseSchema.refine(value => parseFloat(value) > 0, {
  message: 'Input must be greater than zero',
});