import { z } from "zod";

const ipSchema = z.string().ip();

z.string().ip().safeParse("127.0.0.1");

const ipSchemaWithAttrs = z
  .string()
  .trim()
  .ip()
  .optional()
  .describe("Some IP Schema");
