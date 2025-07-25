import { z } from "zod/v4";

const schema = z
  .string()
  .transform((val) => val.length)
  .prefault("tuna");

schema.parse(undefined);

const withRecord = z.record(z.string(), z.string()).prefault({});

function shouldNotMatch(someApi: any) {
  return someApi.default("tuna");
}
