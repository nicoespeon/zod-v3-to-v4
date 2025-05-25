import { z } from "zod/v4";

const schema = z.string({
  error: (issue) => {
    if (issue.code === "invalid_type") {
      return "Not a string";
    }
    return;
  },
});

const defaultReturn = z.string({});
