import { z } from "zod";

const withTransform = z
  .string()
  .transform((val) => val.length)
  .default("tuna");
const withCoerce = z.number({ coerce: true }).default(0);
const withPipe = z.string().pipe(z.string().email()).default("a@b.com");
const withPreprocess = z
  .preprocess((val) => String(val), z.string())
  .default("hello");

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
