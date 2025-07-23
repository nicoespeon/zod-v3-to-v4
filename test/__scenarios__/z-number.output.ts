import { z } from "zod/v4";

const safeNumber = z.int().min(2);

const integerNumber = z.int();

const integerNumberWithAttrs = z.int().max(23).gt(10);

type Integer = z.infer<typeof integerNumber>;
