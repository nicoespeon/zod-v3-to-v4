import { z } from "zod/v4";

const myFunction = z.function({
  input: [
    z.object({
      name: z.string(),
      age: z.number(),
    }),
    z.string().optional(),
  ],
  output: z.string(),
});

myFunction.implement((input) => {
  return `Hello ${input.name}, you are ${input.age} years old.`;
});
