import { z } from "zod";

// Converted to top-level APIs
z.string().date();
z.string().time();
z.string().datetime();
z.string().duration();

// A `date` member access inside an argument is NOT a `.date()` chain call
declare const batch: { date: unknown };
z.string().min(1).safeParse(batch.date);
