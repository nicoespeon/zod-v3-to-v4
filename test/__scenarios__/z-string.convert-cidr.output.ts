import { z } from "zod/v4";

const cidrSchema = z.union([z.cidrv4(), z.cidrv6()]);

const cidrSchemaWithAttrs = z.union([
  z.cidrv4().trim().optional().describe("Some CIDR Schema"),
  z.cidrv6().trim().optional().describe("Some CIDR Schema"),
]);
