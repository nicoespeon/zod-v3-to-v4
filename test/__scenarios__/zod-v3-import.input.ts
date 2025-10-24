import { z } from "zod/v3";

const safeNumber = z.number().min(2).safe();
