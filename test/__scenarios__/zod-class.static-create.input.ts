import { z } from "zod";

const optionalString = z.ZodOptional.create(z.string());
const nullableNumber = z.ZodNullable.create(z.number());
const pair = z.ZodTuple.create([z.string(), z.number()]);

// Sanity check: not a Zod reference
class ZodOptional {
  static create(x: string) {
    return x;
  }
}
const notZod = ZodOptional.create("hello");
