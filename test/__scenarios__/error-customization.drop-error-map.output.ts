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

const fooId = z.union([z.literal("VALUE_A"), z.literal("VALUE_B")], {
  error: () => "Invalid Foo value: must be VALUE_A or VALUE_B",
});
