import { z } from "zod";

const fileSchema = z.instanceof(File);

const fileWithMessage = z.instanceof(File, {
  message: "Input must be a valid file",
});

const optionalFile = z.instanceof(File).optional();

// Refines should be left alone — only the instanceof(File) part is converted
const fileWithRefines = z
  .instanceof(File)
  // @ts-ignore - zod/v4 import doesn't have proper type for File
  .refine((file) => file.size > 0, "Please select a file")
  .refine(
    // @ts-ignore - zod/v4 import doesn't have proper type for File
    (file) => file.size <= 5_000_000,
    "File size must be less than 5MB",
  );

// Should NOT be converted — not File
class MyCustomClass {}
const customSchema = z.instanceof(MyCustomClass);
const customWithMessage = z.instanceof(MyCustomClass, {
  message: "Must be an instance of MyCustomClass",
});

// Should NOT be converted — not a Zod reference
let someLib: any;
someLib.instanceof(File);
