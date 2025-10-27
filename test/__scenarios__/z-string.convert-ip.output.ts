import { z } from "zod/v4";

const ipSchema = z.union([z.ipv4(), z.ipv6()]);

z.union([z.ipv4(), z.ipv6()]).safeParse("127.0.0.1");

const ipSchemaWithAttrs = z
  .union([z.ipv4().trim(), z.ipv6().trim()])
  .optional()
  .describe("Some IP Schema");
