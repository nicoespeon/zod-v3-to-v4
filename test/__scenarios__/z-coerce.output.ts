import { z } from "zod/v4";

z.coerce.bigint();
z.coerce.boolean();
z.coerce.number();
z.coerce.string();
z.coerce.date();

// Support shorthand assignments
const coerce = true;
z.coerce.string();

// Preserve other attributes
const dateSchema = z.coerce
  .date({
    error: (issue) =>
      issue.input === undefined ? "Date is required" : "Not a date",
  })
  .min(new Date());
