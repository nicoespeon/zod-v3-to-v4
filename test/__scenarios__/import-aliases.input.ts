import { z as zod } from "zod";

const safeNumber = zod.number().min(2).safe();
