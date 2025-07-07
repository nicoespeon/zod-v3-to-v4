import { z } from "zod";

enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
}

const ColorSchema = z.nativeEnum(Color);
