import { z } from "zod/v4";

// Normalization runs before validation, the migration must preserve that
z.string().trim().pipe(z.email());
z.string().toLowerCase().pipe(z.uuid());
z.string().trim().pipe(z.iso.datetime());
z.string().trim().pipe(z.union([z.ipv4(), z.ipv6()]));

// Args still move to the top-level API
z.string().trim().pipe(z.url("Please enter a valid URL"));

// Checks placed before the normalization stay on `z.string()`
z.string().min(1).trim().pipe(z.email());

// String checks placed after the format follow it
z.string().trim().pipe(z.email().max(100));

// Wrappers apply to the whole schema
z.string().trim().pipe(z.email()).optional();
z.string().trim().pipe(z.email().max(100)).describe("Contact email");

// Normalization after the format is already in the right order
z.email().trim();

// Sanity check: non-Zod chain, left untouched
class TextField {
  trim() {
    return this;
  }
  email() {
    return this;
  }
}
new TextField().trim().email();
