import { z } from "zod";

z.bigint({ coerce: true });
z.boolean({ coerce: true });
z.number({ coerce: true });
z.string({ coerce: true });
z.date({ coerce: true });

// Support shorthand assignments
const coerce = true;
z.string({ coerce });

// Preserve other attributes
const dateSchema = z
  .date({
    coerce: true,
    required_error: "Date is required",
    invalid_type_error: "Not a date",
  })
  .min(new Date());
