import { z } from "zod";

// Normalization runs before validation, the migration must preserve that
z.string().trim().email();
z.string().toLowerCase().uuid();
z.string().trim().datetime();
z.string().trim().ip();

// Args still move to the top-level API
z.string().trim().url("Please enter a valid URL");

// Checks placed before the normalization stay on `z.string()`
z.string().min(1).trim().email();

// String checks placed after the format follow it
z.string().trim().email().max(100);

// Wrappers apply to the whole schema
z.string().trim().email().optional();
z.string().trim().email().describe("Contact email").max(100);

// Normalization after the format is already in the right order
z.string().email().trim();

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
