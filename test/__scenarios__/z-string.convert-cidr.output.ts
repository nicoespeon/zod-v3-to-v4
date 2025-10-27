import { z } from "zod/v4";

const cidrSchema = z.union([z.cidrv4(), z.cidrv6()]);

z.union([z.cidrv4(), z.cidrv6()]).safeParse("127.0.0.1/32");

const cidrSchemaWithAttrs = z
  .union([z.cidrv4().trim(), z.cidrv6().trim()])
  .optional()
  .describe("Some CIDR Schema");
