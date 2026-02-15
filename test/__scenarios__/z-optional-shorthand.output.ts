import { z } from "zod/v4";

const optStr = z.string().optional();
const optNum = z.number().optional();
const optBool = z.boolean().optional();
