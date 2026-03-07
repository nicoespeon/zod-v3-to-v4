import { z } from "zod/v4";

const withTransform = z
  .string()
  .transform((val) => val.length)
  .prefault("tuna");
const withCoerce = z.coerce.number().prefault(0);
const withPipe = z.string().pipe(z.email()).prefault("a@b.com");
const withPreprocess = z
  .preprocess((val) => String(val), z.string())
  .prefault("hello");

// Should stay as default (simple schemas without transforms)
const simpleString = z.string().default("hello");
const simpleNumber = z.number().default(42);
const simpleEnum = z.enum(["full", "med", "sm"]).default("sm").optional();
const simpleRecord = z.record(z.string(), z.string()).default({});
const simpleArray = z.array(z.string()).default([]);
const withRefinement = z.string().min(5).default("hello world");
const simpleObject = z
  .object({ name: z.string() })
  .default({ name: "hi" });

// Should not match (non-zod)
function shouldNotMatch(someApi: any) {
  return someApi.default("tuna");
}
