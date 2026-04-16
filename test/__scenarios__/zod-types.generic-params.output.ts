import { z, ZodType } from "zod/v4";

type MySchema = ZodType<string, string>;
function processSchema(schema: ZodType<number, number>) {
  return schema;
}
type Only2Generics = ZodType<string, string>;

// ZodSchema is an alias of ZodType in v3 — should get renamed *and* have its middle generic stripped
type AliasPrefixed = z.ZodType<string, string>;
type AliasUnprefixed = ZodType<string, string>;
