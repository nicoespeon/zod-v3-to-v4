import { z } from "zod/v4";

z.object({}).superRefine((val, ctx) => {
  ctx.addIssue({
    code: "custom",
    path: [],
  });
});

const similarCodes = [
  "custom",
  "invalid_type",
  "unrecognized_keys",
  "too_big",
  "too_small",
  "not_multiple_of",
  "invalid_union",
];

const removedCodes = [
  "invalid_type",
  "invalid_union",
  "invalid_type",
  "invalid_type",
  "invalid_type",
  "invalid_type",
  "invalid_type",
  "invalid_type",
  "invalid_type",
];

let myApi: any;
const shouldNotChange = [myApi.ZodIssueCode.custom];
