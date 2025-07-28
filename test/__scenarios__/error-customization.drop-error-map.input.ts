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

const fooId = z.union([z.literal("VALUE_A"), z.literal("VALUE_B")], {
  errorMap: () => ({
    message: "Invalid Foo value: must be VALUE_A or VALUE_B",
  }),
});
