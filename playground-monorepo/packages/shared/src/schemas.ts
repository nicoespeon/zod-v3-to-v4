import { z } from "zod";

// Shared Zod v3 schemas that should be migrated
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.date(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
});

export type User = z.infer<typeof userSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
