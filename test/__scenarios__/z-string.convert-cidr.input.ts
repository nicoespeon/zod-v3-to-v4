import { z } from "zod";

const cidrSchema = z.string().cidr();

const cidrSchemaWithAttrs = z
  .string()
  .trim()
  .cidr()
  .optional()
  .describe("Some CIDR Schema");
