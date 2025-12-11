import { z, ZodRecord } from "zod/v4";

export function promptCallback(input: z.infer<ZodRecord<any, any>>) {
  return `${input.greeting ?? "Hello"} ${input.user.firstName}! You are from ${input.user.location.city}, ${input.user.location.country}.`;
}
