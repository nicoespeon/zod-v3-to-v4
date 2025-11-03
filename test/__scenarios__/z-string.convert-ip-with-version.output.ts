import { z } from "zod/v4";

const ipv4Schema = z.ipv4();
const ipv6Schema = z.ipv6();
const anyIpSchema = z.union([z.ipv4(), z.ipv6()]);

z.ipv4().safeParse("127.0.0.1");
z.ipv6().safeParse("::1");

const ipv4SchemaWithAttrs = z.ipv4().trim().optional().describe("IPv4 Schema");

const ipv6SchemaWithAttrs = z.ipv6().trim().optional().describe("IPv6 Schema");
