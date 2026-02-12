import { z } from "zod";

// Basic types with description
z.boolean({ description: "A boolean value" });
z.string({ description: "A string value" });
z.number({ description: "A number value" });
z.date({ description: "A date value" });

// Description with chained methods
z.string({ description: "An email" }).email();
z.number({ description: "A positive number" }).min(0);

// Description combined with error keys
z.string({
  description: "User name",
  required_error: "Name is required",
  invalid_type_error: "Must be a string",
});

// Description combined with coerce
z.number({ description: "Coerced number", coerce: true });

// Description with message
z.string({
  description: "Important field",
  message: "Invalid value",
});

// Shorthand property assignment
const description = "My schema";
z.boolean({ description });

// Variable reference
const myDesc = "Dynamic description";
z.string({ description: myDesc });

// Template literal
z.number({ description: `Count of items` });

// z.object with description in second params argument
z.object({ name: z.string() }, { description: "A user object" });

// z.object shape field named "description" -- should NOT be transformed
z.object({ description: z.string() });

// z.object with both: shape field AND second-arg description
z.object(
  { description: z.string(), name: z.string() },
  { description: "Schema with description field" },
);

// Description with errorMap that only returns defaults (gets removed)
z.string({
  description: "With error map",
  errorMap: (issue, ctx) => {
    return { message: ctx.defaultError };
  },
});
