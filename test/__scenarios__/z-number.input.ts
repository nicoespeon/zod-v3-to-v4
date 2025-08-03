import { z } from "zod";

const safeNumber = z.number().min(2).safe();

const integerNumber = z.number().int();

const integerNumberWithAttrs = z.number().max(23).int().gt(10);

type Integer = z.infer<typeof integerNumber>;

// Coerce should be untouched, it doesn't have .int()
const coercedInteger = z.coerce.number().positive().int();

const zInt = z.number().int().or(z.string());
const zIntWithPipe = z.number().or(z.string()).pipe(z.number().int());
const manyZInts = z.number().int().or(z.string()).pipe(z.number().int());
