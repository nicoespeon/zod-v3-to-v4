import { z } from "zod/v4";

export function promptCallback(input: z.infer<z.ZodRecord<any, any>>) {
  return `${input.greeting ?? "Hello"} ${input.user.firstName}! You are from ${input.user.location.city}, ${input.user.location.country}.`;
}

export function safeParseResult<
  SameIAndO extends z.ZodSafeParseResult<string>,
  // This will only keep the output type
  // See https://github.com/colinhacks/zod/issues/5195
  DifferentIAndO extends z.ZodSafeParseResult<string>,
>(_: SameIAndO, __: DifferentIAndO) {}

export function zodTypeAny(_: z.ZodType) {}
