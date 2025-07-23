// @ts-nocheck
import { z } from "zod";

// Error handling examples
const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

// Async validation
const asyncValidationSchema = z
  .object({
    email: z.string().email(),
  })
  .refine(async (data) => {
    // Simulate async validation
    return data.email !== "taken@example.com";
  }, "Email is already taken");

// Custom error messages
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Nested schemas with complex validation
const nestedSchema = z.object({
  user: z.object({
    profile: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      bio: z.string().max(500).optional(),
    }),
    settings: z.object({
      theme: z.enum(["light", "dark"]),
      notifications: z.boolean(),
    }),
  }),
});

export {
  apiResponseSchema,
  asyncValidationSchema,
  nestedSchema,
  passwordSchema,
};
