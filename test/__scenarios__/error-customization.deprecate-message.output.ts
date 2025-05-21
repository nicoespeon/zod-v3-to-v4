import { z } from "zod/v4";

const schema = z
  .string()
  .min(5, { error: "Too short." })
  .max(10, { error: "Too long." });
