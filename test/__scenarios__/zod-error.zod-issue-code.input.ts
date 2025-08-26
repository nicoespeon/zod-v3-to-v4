import { z } from "zod";

z.object({}).superRefine((val, ctx) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: [],
  });
});

const similarCodes = [
  z.ZodIssueCode.custom,
  z.ZodIssueCode.invalid_type,
  z.ZodIssueCode.unrecognized_keys,
  z.ZodIssueCode.too_big,
  z.ZodIssueCode.too_small,
  z.ZodIssueCode.not_multiple_of,
  z.ZodIssueCode.invalid_union,
];

const removedCodes = [
  z.ZodIssueCode.invalid_literal,
  z.ZodIssueCode.invalid_union_discriminator,
  z.ZodIssueCode.invalid_enum_value,
  z.ZodIssueCode.invalid_arguments,
  z.ZodIssueCode.invalid_return_type,
  z.ZodIssueCode.invalid_date,
  z.ZodIssueCode.invalid_string,
  z.ZodIssueCode.invalid_intersection_types,
  z.ZodIssueCode.not_finite,
];

let myApi: any;
const shouldNotChange = [myApi.ZodIssueCode.custom];
