import { z } from "zod";

export const basicReturn = z.object({}).superRefine(() => {
  return true;
});

export const earlyReturn = z.object({}).superRefine((val, ctx) => {
  if (!val) {
    return false;
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Something went wrong",
  });
});

export const multipleReturns = z.enum(["a", "b", "c"]).superRefine((val) => {
  if (val === "a") {
    return 1;
  }
  if (val === "b") {
    return 2;
  }
  return 3;
});

export const nestedFunctionExpression = z.object({}).superRefine(() => {
  const helper = function () {
    // This should not be affected
    return "hello";
  };
  return helper() === "hello";
});

export const nestedArrow = z.object({}).superRefine(() => {
  const items = [1, 2, 3].map(x => {
    // This should not be affected
    return x * 2;
  });
  return items.length > 0;
});

export const chainedSuperRefine = z
  .string()
  .superRefine((val, ctx) => {
    if (val.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Empty string",
      });
    }
    return true;
  })
  .superRefine((val, ctx) => {
    if (val === "invalid") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid value",
      });
    }
    return false;
  });

// Untouched returns (already valid)
export const returnUndefined = z.object({}).superRefine(() => {
  return undefined;
});

export const returnNothing = z.object({}).superRefine(() => {
  return;
});

// Returned CallExpression should be preserved (in case of side-effect)
let totalIssues = 0;
const addToTotalIssues = (newIssues: number) => {
  const newValue = totalIssues + newIssues;
  // Side effect
  totalIssues = newValue;
  return newValue;
}


export const myObject = z.object({}).superRefine(() => {
  const newIssuesSum = 5;
  return addToTotalIssues(newIssuesSum);
});