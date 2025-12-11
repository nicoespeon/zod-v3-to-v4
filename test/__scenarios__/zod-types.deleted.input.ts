import { AnyZodObject, SafeParseReturnType, z } from "zod";

export function promptCallback(input: z.infer<AnyZodObject>) {
  return `${input.greeting ?? "Hello"} ${input.user.firstName}! You are from ${input.user.location.city}, ${input.user.location.country}.`;
}

export function safeParseResult<
  SameIAndO extends SafeParseReturnType<string, string>,
  // This will only keep the output type
  // See https://github.com/colinhacks/zod/issues/5195
  DifferentIAndO extends SafeParseReturnType<number, string>,
>(_: SameIAndO, __: DifferentIAndO) {}
