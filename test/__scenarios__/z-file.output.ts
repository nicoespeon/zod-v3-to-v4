import { z } from "zod/v4";

const fileSchema = z.file();

const fileWithMessage = z.file({
  error: "Input must be a valid file",
});

const optionalFile = z.file().optional();

// Refines should be left alone — only the instanceof(File) part is converted
const fileWithRefines = z
  .file()
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
  error: "Must be an instance of MyCustomClass",
});

// Should NOT be converted — not a Zod reference
let someLib: any;
someLib.instanceof(File);
