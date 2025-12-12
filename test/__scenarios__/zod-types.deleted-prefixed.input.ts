import { z } from "zod";

export function promptCallback(input: z.infer<z.AnyZodObject>) {
  return `${input.greeting ?? "Hello"} ${input.user.firstName}! You are from ${input.user.location.city}, ${input.user.location.country}.`;
}

export function safeParseResult<
  SameIAndO extends z.SafeParseReturnType<string, string>,
  // This will only keep the output type
  // See https://github.com/colinhacks/zod/issues/5195
  DifferentIAndO extends z.SafeParseReturnType<number, string>,
>(_: SameIAndO, __: DifferentIAndO) {}

export function zodTypeAny(_: z.ZodTypeAny) {}
