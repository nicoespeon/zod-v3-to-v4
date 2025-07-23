import { z } from "zod";

const safeNumber = z.number().min(2).safe();

const integerNumber = z.number().int();

const integerNumberWithAttrs = z.number().max(23).int().gt(10);

type Integer = z.infer<typeof integerNumber>;
