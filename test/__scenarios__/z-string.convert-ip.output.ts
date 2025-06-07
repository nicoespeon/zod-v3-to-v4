import { z } from "zod/v4";

const ipSchema = z.union([z.ipv4(), z.ipv6()]);

const ipSchemaWithAttrs = z.union([
  z.ipv4().trim().optional().describe("Some IP Schema"),
  z.ipv6().trim().optional().describe("Some IP Schema"),
]);
