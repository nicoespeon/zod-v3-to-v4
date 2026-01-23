import { z } from "zod/v4";

export const basicReturn = z.object({}).superRefine(() => {
  return;
});

export const earlyReturn = z.object({}).superRefine((val, ctx) => {
  if (!val) {
    return;
  }

  ctx.addIssue({
    code: "custom",
    message: "Something went wrong",
  });
});

export const multipleReturns = z.enum(["a", "b", "c"]).superRefine((val) => {
  if (val === "a") {
    return;
  }
  if (val === "b") {
    return;
  }
  return;
});

export const nestedFunctionExpression = z.object({}).superRefine(() => {
  const helper = function () {
    // This should not be affected
    return "hello";
  };
  return;
});

export const nestedArrow = z.object({}).superRefine(() => {
  const items = [1, 2, 3].map(x => {
    // This should not be affected
    return x * 2;
  });
  return;
});

export const chainedSuperRefine = z
  .string()
  .superRefine((val, ctx) => {
    if (val.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Empty string",
      });
    }
    return;
  })
  .superRefine((val, ctx) => {
    if (val === "invalid") {
      ctx.addIssue({
        code: "custom",
        message: "Invalid value",
      });
    }
    return;
  });

// Untouched returns (already valid)
export const returnUndefined = z.object({}).superRefine(() => {
  return undefined;
});

export const returnNothing = z.object({}).superRefine(() => {
  return;
});
