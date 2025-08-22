import { z } from "zod/v4";

// Converted to top-level APIs
z.email();
z.uuid();
z.url();
z.emoji();
z.base64();
z.base64url();
z.nanoid();
z.cuid();
z.cuid2();
z.ulid();

// With other params
z.email().min(23).max(100);
z.email()
  .describe("Lorem ipsum dolor sit amet apercitur sit nuc")
  .min(23)
  .max(100);

// With args
export const urlSchema = z.object({
  url: z
    .url("Please enter a valid URL")
    .min(1, "URL is required")
    .transform((url) => (url.endsWith("/") ? url.slice(0, -1) : url)),
});

// @ts-expect-error
z.url().safeParse(stripeSession.url);
