import { z } from "zod";

const NonEmpty = z.array(z.string()).describe("Non-empty array").nonempty();
