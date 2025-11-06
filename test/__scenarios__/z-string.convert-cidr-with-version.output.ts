import { z } from "zod/v4";

const cidrv4Schema = z.cidrv4();
const cidrv6Schema = z.cidrv6();
const anyCidrSchema = z.union([z.cidrv4(), z.cidrv6()]);

z.cidrv4().safeParse("127.0.0.1/32");
z.cidrv6().safeParse("2001:db8::/32");

const cidrv4SchemaWithAttrs = z
  .cidrv4()
  .trim()
  .optional()
  .describe("IPv4 CIDR Schema");

const cidrv6SchemaWithAttrs = z
  .cidrv6()
  .trim()
  .optional()
  .describe("IPv6 CIDR Schema");
