import { z } from "zod";

z.string({
  required_error: "This field is required",
  invalid_type_error: "Not a string",
});

z.string({
  required_error: "This field is necessary",
});

z.string({
  invalid_type_error: "Not a number",
});

z.string({
  required_error: "This field is required",
  invalid_type_error: "Not a string",
  message: "This message takes precedence",
});
