import { z } from "zod/v4";

// Converted to top-level APIs
z.iso.date();
z.iso.time();
z.iso.datetime();
z.iso.duration();

// A `date` member access inside an argument is NOT a `.date()` chain call
declare const batch: { date: unknown };
z.string().min(1).safeParse(batch.date);
