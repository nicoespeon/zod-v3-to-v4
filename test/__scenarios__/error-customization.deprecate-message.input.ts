import { z } from "zod";

const schema = z
  .string()
  .min(5, { message: "Too short." })
  .max(10, { message: "Too long." });
