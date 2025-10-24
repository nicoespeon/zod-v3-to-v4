import { z } from "zod/v4";

const safeNumber = z.int().min(2);
