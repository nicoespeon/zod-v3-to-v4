import { z } from "zod/v4";

z.record(z.string(), z.string());

const Phone = z.object({
  name: z.string(),
  type: z.literal("phone"),
});
const Tablet = z.object({
  name: z.string(),
  type: z.literal("tablet"),
  size: z.number(),
});
const Device = z.union([Phone, Tablet]);

const DeviceList = z.record(z.string(), Device);
type DeviceList = z.infer<typeof DeviceList>;
