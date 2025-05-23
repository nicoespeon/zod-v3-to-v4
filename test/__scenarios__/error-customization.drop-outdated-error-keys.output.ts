import { z } from "zod/v4";

z.string({
  error: (issue) =>
    issue.input === undefined ? "This field is required" : "Not a string",
});

z.string({
  error: (issue) =>
    issue.input === undefined ? "This field is necessary" : undefined,
});

z.string({
  error: (issue) => (issue.input === undefined ? undefined : "Not a number"),
});

z.string({
  error: "This message takes precedence",
});
