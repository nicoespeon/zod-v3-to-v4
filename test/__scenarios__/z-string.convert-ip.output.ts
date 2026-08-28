import { z } from "zod/v4";

const ipv4Schema = z.ipv4();
const ipv6Schema = z.ipv6();
const anyIpSchema = z.union([z.ipv4(), z.ipv6()]);

z.ipv4().safeParse("127.0.0.1");
z.ipv6().safeParse("::1");
z.union([z.ipv4(), z.ipv6()]).safeParse("127.0.0.1");

const ipv4SchemaWithAttrs = z
  .string()
  .trim()
  .pipe(z.ipv4())
  .optional()
  .describe("IPv4 Schema");

const ipv6SchemaWithAttrs = z
  .string()
  .trim()
  .pipe(z.ipv6())
  .optional()
  .describe("IPv6 Schema");

const ipSchemaWithAttrs = z
  .string()
  .trim()
  .pipe(z.union([z.ipv4(), z.ipv6()]))
  .optional()
  .describe("Some IP Schema");
