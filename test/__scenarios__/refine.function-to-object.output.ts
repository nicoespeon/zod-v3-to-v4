import { z } from "zod/v4";

// Simple: arrow function returning { message }
const a = z.string().refine((val) => val.length > 0, {
  error: "Must not be empty",
});

// With path: arrow function returning { path, message }
const schema = z
  .object({
    isoCountry: z.string(),
    phoneNumber: z.string(),
  })
  .refine(
    ({ isoCountry, phoneNumber }) => {
      return someCheck();
    },
    { path: ["phoneNumber"], error: "Invalid phone number" },
  );

// With path and params: arrow function returning { path, message, params }
const b = z.string().refine((val) => val.length > 5, {
  path: ["field"],
  params: { min: 5 },
  error: "Too short",
});

// Block-body arrow function returning { message }
const f = z.string().refine((val) => val.length > 0, {
  error: "Must not be empty",
});

// Block-body arrow function returning { path, message }
const g = z.string().refine((val) => val.length > 0, {
  path: ["field"],
  error: "Must not be empty",
});

// Already a plain object — should still convert message to error
const c = z.string().refine((val) => val.length > 0, {
  error: "Must not be empty",
});

// String message — should be left as-is
const d = z.string().refine((val) => val.length > 0, "Must not be empty");

// Parameterized function — can't safely unwrap, leave untouched
// @ts-ignore
const e = z.string().refine((val) => val.length > 0, (val) => ({
  message: `"${val}" must not be empty`,
}));

// Sanity check: non-Zod .refine() with function arg, left untouched
class QueryBuilder {
  refine(predicate: (val: unknown) => boolean, opts: () => { message: string }) {
    return this;
  }
}
const qb = new QueryBuilder();
qb.refine((val) => !!val, () => ({ message: "Required" }));

declare function someCheck(): boolean;
