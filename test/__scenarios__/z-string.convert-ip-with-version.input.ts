import { z } from "zod";

const ipv4Schema = z.string().ip({ version: "v4" });
const ipv6Schema = z.string().ip({ version: "v6" });
const anyIpSchema = z.string().ip();

z.string().ip({ version: "v4" }).safeParse("127.0.0.1");
z.string().ip({ version: "v6" }).safeParse("::1");

const ipv4SchemaWithAttrs = z
  .string()
  .trim()
  .ip({ version: "v4" })
  .optional()
  .describe("IPv4 Schema");

const ipv6SchemaWithAttrs = z
  .string()
  .trim()
  .ip({ version: "v6" })
  .optional()
  .describe("IPv6 Schema");
