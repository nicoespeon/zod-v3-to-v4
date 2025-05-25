import { z } from "zod";

const schema = z.string({
  errorMap: (issue, ctx) => {
    if (issue.code === "invalid_type") {
      return { message: "Not a string" };
    }
    return { message: ctx.defaultError };
  },
});

const defaultReturn = z.string({
  errorMap: (_issue, ctx) => {
    return { message: ctx.defaultError };
  },
});
