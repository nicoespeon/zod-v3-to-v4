import { z as zod } from "zod/v4";

const safeNumber = zod.int().min(2);
