import { z } from "zod";

const cidrv4Schema = z.string().cidr({ version: "v4" });
const cidrv6Schema = z.string().cidr({ version: "v6" });
const anyCidrSchema = z.string().cidr();

z.string().cidr({ version: "v4" }).safeParse("127.0.0.1/32");
z.string().cidr({ version: "v6" }).safeParse("2001:db8::/32");

const cidrv4SchemaWithAttrs = z
  .string()
  .trim()
  .cidr({ version: "v4" })
  .optional()
  .describe("IPv4 CIDR Schema");

const cidrv6SchemaWithAttrs = z
  .string()
  .trim()
  .cidr({ version: "v6" })
  .optional()
  .describe("IPv6 CIDR Schema");
