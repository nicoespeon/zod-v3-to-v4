import { z } from "zod";

const nullishFn = z
  .function()
  .args(z.custom<string[]>(), z.custom<{ updateGrid: () => void }>())
  .returns(z.custom<number[]>())
  // @ts-ignore this zod/v4 function() has a different type, but it was fixed in later versions
  .nullish();

const optionalFn = z
  .function()
  .args(z.string())
  .returns(z.number())
  // @ts-ignore this zod/v4 function() has a different type, but it was fixed in later versions
  .optional();

const nullableFn = z
  .function()
  .args(z.string(), z.number())
  .returns(z.boolean())
  // @ts-ignore this zod/v4 function() has a different type, but it was fixed in later versions
  .nullable();

// Should not be affected
let myLib: any;
const notZod = myLib.function().args(z.string()).returns(z.number()).nullish();
