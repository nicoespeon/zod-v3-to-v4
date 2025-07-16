import { z } from "zod/v4";

z.strictObject({ name: z.string() });
z.strictObject({ name: z.string() }).describe("Some Object Schema");
