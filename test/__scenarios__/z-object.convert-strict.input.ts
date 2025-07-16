import { z } from "zod";

z.object({ name: z.string() }).strict();
z.object({ name: z.string() }).describe("Some Object Schema").strict();
