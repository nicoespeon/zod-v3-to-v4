import { z } from "zod";

z.object({ name: z.string() }).strip();
// `nonstrict` used to be a deprecated alias of `strip`
z.object({ name: z.string() }).nonstrict();
