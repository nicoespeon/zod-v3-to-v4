import { z } from "zod/v4";

z.object({ name: z.string() });
// `nonstrict` used to be a deprecated alias of `strip`
z.object({ name: z.string() });
