import { z } from "zod";

const MyRecord = z.record(z.enum(["a", "b", "c"]), z.number());
type MyRecord = z.infer<typeof MyRecord>;
