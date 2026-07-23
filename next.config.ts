import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (gRPC/protobuf/WASM deps) and @vercel/blob's client (undici)
  // are known to fail Vercel's serverless file-tracing when webpack tries to
  // bundle them — the trace can miss files these packages require dynamically
  // at runtime, which works fine locally (full node_modules present) but
  // crashes the deployed function at import time with no logs and no network
  // activity, since the crash happens before any of our code runs. Marking
  // them external makes Next.js leave them as plain requires resolved from
  // node_modules, which Vercel's tracer handles correctly (includes the whole
  // package rather than guessing which files are needed).
  serverExternalPackages: ["firebase-admin", "@vercel/blob"],
};

export default nextConfig;
