import { z } from "zod";

const schema = z.string({
  errorMap: (issue, ctx) => {
    if (issue.code === "too_small") {
      return { message: `Value must be >${issue.minimum}` };
    }
    return { message: ctx.defaultError };
  },
});
