import { z } from "zod";

// Converted to top-level APIs
z.string().email();
z.string().uuid();
z.string().url();
z.string().emoji();
z.string().base64();
z.string().base64url();
z.string().nanoid();
z.string().cuid();
z.string().cuid2();
z.string().ulid();

// With other params
z.string().min(23).email().max(100);
z.string()
  .describe("Lorem ipsum dolor sit amet apercitur sit nuc")
  .min(23)
  .email()
  .max(100);

// With args
export const urlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .transform((url) => (url.endsWith("/") ? url.slice(0, -1) : url)),
});

// @ts-expect-error
z.string().url().safeParse(stripeSession.url);
