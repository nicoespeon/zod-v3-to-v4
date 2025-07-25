import { z } from "zod";

z.record(z.string());

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

const DeviceList = z.record(Device);
type DeviceList = z.infer<typeof DeviceList>;
