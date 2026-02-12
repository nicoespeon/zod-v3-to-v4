import { z } from "zod/v4";

// Basic types with description
z.boolean().describe("A boolean value");
z.string().describe("A string value");
z.number().describe("A number value");
z.date().describe("A date value");

// Description with chained methods
z.email().describe("An email");
z.number().describe("A positive number").min(0);

// Description combined with error keys
z.string({
  error: (issue) =>
    issue.input === undefined ? "Name is required" : "Must be a string",
}).describe("User name");

// Description combined with coerce
z.coerce.number().describe("Coerced number");

// Description with message
z.string({
  error: "Invalid value",
}).describe("Important field");

// Shorthand property assignment
const description = "My schema";
z.boolean().describe(description);

// Variable reference
const myDesc = "Dynamic description";
z.string().describe(myDesc);

// Template literal
z.number().describe(`Count of items`);

// z.object with description in second params argument
z.object({ name: z.string() }).describe("A user object");

// z.object shape field named "description" -- should NOT be transformed
z.object({ description: z.string() });

// z.object with both: shape field AND second-arg description
z.object({ description: z.string(), name: z.string() }).describe(
  "Schema with description field",
);

// Description with errorMap that only returns defaults (gets removed)
z.string().describe("With error map");
