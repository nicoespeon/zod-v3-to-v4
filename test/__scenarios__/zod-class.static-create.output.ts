import { z } from "zod/v4";

const optionalString = z.optional(z.string());
const nullableNumber = z.nullable(z.number());
const pair = z.tuple([z.string(), z.number()]);

// Sanity check: not a Zod reference
class ZodOptional {
  static create(x: string) {
    return x;
  }
}
const notZod = ZodOptional.create("hello");
