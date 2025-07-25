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

let app: any;
app.use((err: Error, res: any) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: "Invalid request syntax" });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({ message: "Validation error" });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
});
