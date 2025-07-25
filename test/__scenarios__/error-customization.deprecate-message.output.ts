import { z } from "zod/v4";

const schema = z
  .string()
  .min(5, {
    error: "Too short.",
  })
  .max(10, {
    error: "Too long.",
  });

// Unrelated, should not match
const zPlatformAlert = z.object({
  severity: z.enum(["info", "warning", "error"]),
  message: z.string(),
});
