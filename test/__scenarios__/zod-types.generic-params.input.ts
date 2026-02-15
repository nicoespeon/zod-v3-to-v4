import { z, ZodType } from "zod";

type MySchema = ZodType<string, z.ZodStringDef, string>;
function processSchema(schema: ZodType<number, z.ZodNumberDef, number>) {
  return schema;
}
type Only2Generics = ZodType<string, z.ZodStringDef>;
