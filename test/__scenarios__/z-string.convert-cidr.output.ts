import { z } from "zod/v4";

const cidrv4Schema = z.cidrv4();
const cidrv6Schema = z.cidrv6();
const anyCidrSchema = z.union([z.cidrv4(), z.cidrv6()]);

z.cidrv4().safeParse("127.0.0.1/32");
z.cidrv6().safeParse("2001:db8::/32");
z.union([z.cidrv4(), z.cidrv6()]).safeParse("127.0.0.1/32");

const cidrv4SchemaWithAttrs = z
  .string()
  .trim()
  .pipe(z.cidrv4())
  .optional()
  .describe("IPv4 CIDR Schema");

const cidrv6SchemaWithAttrs = z
  .string()
  .trim()
  .pipe(z.cidrv6())
  .optional()
  .describe("IPv6 CIDR Schema");

const cidrSchemaWithAttrs = z
  .string()
  .trim()
  .pipe(z.union([z.cidrv4(), z.cidrv6()]))
  .optional()
  .describe("Some CIDR Schema");
