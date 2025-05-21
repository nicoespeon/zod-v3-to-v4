import { z } from "zod/v4";

const schema = z.string({
  error: (issue) => {
    // @ts-expect-error Zod v4 type seems to be incorrect here
    if (issue.code === "too_small") {
      return `Value must be >${issue.minimum}`;
    }
  },
});
