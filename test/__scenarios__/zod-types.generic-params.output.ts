import { z, ZodType } from "zod/v4";

type MySchema = ZodType<string, string>;
function processSchema(schema: ZodType<number, number>) {
  return schema;
}
type Only2Generics = ZodType<string, string>;

// ZodSchema is an alias of ZodType in v3
type AliasPrefixed = z.ZodType<string, string>;
type AliasUnprefixed = ZodType<string, string>;

type PrefixedZodType = z.ZodType<string, string>;
