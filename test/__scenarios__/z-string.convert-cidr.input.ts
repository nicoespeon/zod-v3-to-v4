import { z } from "zod";

const cidrSchema = z.string().cidr();

z.string().cidr().safeParse("127.0.0.1/32");

const cidrSchemaWithAttrs = z
  .string()
  .trim()
  .cidr()
  .optional()
  .describe("Some CIDR Schema");
