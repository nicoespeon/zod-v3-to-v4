import { z } from "zod/v4";

enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
}

const ColorSchema = z.enum(Color);

// Rename Enum to enum
const schema = z.enum(["id_token", "token", "code"]);
schema.enum.token;

let mySchema: any;
console.log("should not change:", mySchema.Enum.token);
