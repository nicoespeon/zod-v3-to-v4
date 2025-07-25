import { z } from "zod/v4";

const CheckInTimeRendererParamsSchema = z.object({
  formatOptions: z
    .looseObject({
      // Date options
      year: z.enum(["numeric", "2-digit"]).optional(),
      month: z
        .enum(["numeric", "2-digit", "long", "short", "narrow"])
        .optional(),
      day: z.enum(["numeric", "2-digit"]).optional(),
      // Time options
      hour: z.enum(["numeric", "2-digit"]).optional(),
      minute: z.enum(["numeric", "2-digit"]).optional(),
      second: z.enum(["numeric", "2-digit"]).optional(),
      hour12: z.boolean().optional(),
      // Timezone options
      timeZone: z.string().optional(),
      timeZoneName: z
        .enum([
          "short",
          "long",
          "shortOffset",
          "longOffset",
          "shortGeneric",
          "longGeneric",
        ])
        .optional(),
    })
    .optional()
    .prefault({
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Los_Angeles",
      timeZoneName: "short",
    }),
});
