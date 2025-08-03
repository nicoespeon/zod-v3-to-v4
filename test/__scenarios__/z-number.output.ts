import { z } from "zod/v4";

const safeNumber = z.int().min(2);

const integerNumber = z.int();

const integerNumberWithAttrs = z.int().max(23).gt(10);

type Integer = z.infer<typeof integerNumber>;

// Coerce should be untouched, it doesn't have .int()
const coercedInteger = z.coerce.number().positive().int();

const zInt = z.int().or(z.string());
const zIntWithPipe = z.number().or(z.string()).pipe(z.int());
const manyZInts = z.int().or(z.string()).pipe(z.int());
