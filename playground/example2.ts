import { z } from "zod";

// More complex Zod v3 examples
const configSchema = z.object({
  database: z.object({
    host: z.string(),
    port: z.number().default(5432),
    username: z.string(),
    password: z.string(),
  }),
  redis: z
    .object({
      url: z.string().url(),
      ttl: z.number().positive(),
    })
    .optional(),
  features: z.record(z.boolean()),
});

// Union and discriminated union examples
const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("user_created"),
    userId: z.string(),
    timestamp: z.date(),
  }),
  z.object({
    type: z.literal("user_updated"),
    userId: z.string(),
    changes: z.record(z.unknown()),
    timestamp: z.date(),
  }),
]);

// Transform and refine examples
const slugSchema = z
  .string()
  .transform((val) => val.toLowerCase().replace(/\s+/g, "-"))
  .refine((val) => val.length > 0, "Slug cannot be empty");

export { configSchema, eventSchema, slugSchema };
