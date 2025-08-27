import { z } from "zod";

enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
}

const ColorSchema = z.nativeEnum(Color);

// Rename Enum to enum
const schema = z.enum(["id_token", "token", "code"]);
schema.Enum.token;

let mySchema: any;
console.log("should not change:", mySchema.Enum.token);
