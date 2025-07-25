import { z } from "zod/v4";

const MyRecord = z.partialRecord(z.enum(["a", "b", "c"]), z.number());
type MyRecord = z.infer<typeof MyRecord>;
