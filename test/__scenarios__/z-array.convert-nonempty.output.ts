import { z } from "zod/v4";

const NonEmpty = z.tuple([z.string()], z.string()).describe("Non-empty array");
