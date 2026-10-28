import { z } from "zod/v4";

const schema = z.object({ email: z.string() });

// Derived from a schema, should match
const strictSchema = schema.refine((data) => data.email !== "", {
  error: "Email is required",
});

// Same-named schemas in different scopes, should match
function emailSchema() {
  const derived = schema.refine((data) => data.email !== "", {
    error: "Email is required",
  });
  return derived;
}
function nameSchema() {
  const derived = z.object({ name: z.string() });
  return derived.refine((data) => data.name !== "", {
    error: "Name is required",
  });
}

// Not a schema, only references one: should not match
type FormErrorOptions = { type: string; message: string };
declare function useForm<T>(options?: { resolver?: unknown }): {
  setError(name: string, error: FormErrorOptions): void;
};
declare function zodResolver(schema: z.ZodType): unknown;

function TypedForm() {
  const form = useForm<z.infer<typeof schema>>();
  form.setError("email", {
    type: "emailExists",
    message: "This email already exists",
  });
}

function ResolverForm() {
  const form = useForm({ resolver: zodResolver(schema) });
  form.setError("email", {
    type: "emailExists",
    message: "This email already exists",
  });
}

// Same name as a schema, but a different variable: should not match
declare const settings: {
  schema: { save(options: { message: string }): void };
};
settings.schema.save({ message: "Saved" });
