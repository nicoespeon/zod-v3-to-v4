import { z } from "zod/v4";

const schema = z
  .string()
  .transform((val) => val.length)
  .prefault("tuna");

schema.parse(undefined);

function shouldNotMatch(someApi: any) {
  return someApi.default("tuna");
}
