import { AnyZodObject, z } from "zod";

export function promptCallback(input: z.infer<AnyZodObject>) {
  return `${input.greeting ?? "Hello"} ${input.user.firstName}! You are from ${input.user.location.city}, ${input.user.location.country}.`;
}
