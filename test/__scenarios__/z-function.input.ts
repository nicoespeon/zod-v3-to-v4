import { z } from "zod";

const myFunction = z
  .function()
  .args(
    z.object({
      name: z.string(),
      age: z.number(),
    }),
    z.string().optional(),
  )
  .returns(z.string());

myFunction.implement((input) => {
  return `Hello ${input.name}, you are ${input.age} years old.`;
});
