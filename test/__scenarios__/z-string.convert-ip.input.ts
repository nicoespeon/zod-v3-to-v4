import { z } from "zod";

const ipSchema = z.string().ip();

const ipSchemaWithAttrs = z
  .string()
  .trim()
  .ip()
  .optional()
  .describe("Some IP Schema");
