import { z } from "zod/v4";

const nullishFn = z
  .function({
    input: [z.custom<string[]>(), z.custom<{ updateGrid: () => void }>()],
    output: z.custom<number[]>()
  })
  // @ts-ignore this zod/v4 function() has a different type, but it was fixed in later versions
  .nullish();

const optionalFn = z
  .function({ input: [z.string()], output: z.number() })
  // @ts-ignore this zod/v4 function() has a different type, but it was fixed in later versions
  .optional();

const nullableFn = z
  .function({ input: [z.string(), z.number()], output: z.boolean() })
  // @ts-ignore this zod/v4 function() has a different type, but it was fixed in later versions
  .nullable();

// Should not be affected
let myLib: any;
const notZod = myLib.function().args(z.string()).returns(z.number()).nullish();
