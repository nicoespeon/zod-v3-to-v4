import { z } from "zod";

// Example Zod v3 schemas that should be migrated to v4
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

const postSchema = z.object({
  title: z.string(),
  content: z.string(),
  author: userSchema,
  tags: z.array(z.string()),
  publishedAt: z.date().optional(),
});

// Some validation examples
type User = z.infer<typeof userSchema>;
type Post = z.infer<typeof postSchema>;

export function validateUser(data: unknown): User {
  return userSchema.parse(data);
}

export function validatePost(data: unknown): Post {
  return postSchema.parse(data);
}
