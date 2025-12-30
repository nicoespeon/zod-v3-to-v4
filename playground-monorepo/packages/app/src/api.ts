import { z } from "zod";

// App-specific Zod v3 schemas
const requestSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  path: z.string().startsWith("/"),
  body: z.unknown().optional(),
});

const responseSchema = z.object({
  status: z.number().int().min(100).max(599),
  data: z.unknown(),
  error: z.string().optional(),
});

export type Request = z.infer<typeof requestSchema>;
export type Response = z.infer<typeof responseSchema>;

export function validateRequest(data: unknown): Request {
  return requestSchema.parse(data);
}
