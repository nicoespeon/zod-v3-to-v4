import { z } from "zod";

z.object({ name: z.string() }).strict();
