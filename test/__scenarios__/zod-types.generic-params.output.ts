import { z, ZodType } from "zod/v4";

type MySchema = ZodType<string, string>;
function processSchema(schema: ZodType<number, number>) {
  return schema;
}
type Only2Generics = ZodType<string, string>;
