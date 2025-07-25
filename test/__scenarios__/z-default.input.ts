import { z } from "zod";

const schema = z
  .string()
  .transform((val) => val.length)
  .default("tuna");

schema.parse(undefined);

const withRecord = z.record(z.string(), z.string()).default({});

function shouldNotMatch(someApi: any) {
  return someApi.default("tuna");
}
