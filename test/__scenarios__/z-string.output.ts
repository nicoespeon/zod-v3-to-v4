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
