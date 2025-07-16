import { z } from "zod";

const schema = z
  .string()
  .transform((val) => val.length)
  .default("tuna");

schema.parse(undefined);

function shouldNotMatch(someApi: any) {
  return someApi.default("tuna");
}
