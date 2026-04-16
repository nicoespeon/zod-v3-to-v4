import { z, ZodSchema, ZodType } from "zod";

type MySchema = ZodType<string, z.ZodStringDef, string>;
function processSchema(schema: ZodType<number, z.ZodNumberDef, number>) {
  return schema;
}
type Only2Generics = ZodType<string, z.ZodStringDef>;

// ZodSchema is an alias of ZodType in v3
type AliasPrefixed = z.ZodSchema<string, z.ZodStringDef, string>;
type AliasUnprefixed = ZodSchema<string, z.ZodStringDef, string>;

type PrefixedZodType = z.ZodType<string, z.ZodStringDef, string>;
