import { serve } from "inngest/express";
import { inngest, functions } from "../inngest/index.js";

// This exposes GET/POST/PUT /api/inngest
// Inngest uses this to discover and trigger your functions
export const inngestHandler = serve({
  client: inngest,
  functions,  // ✅ your syncUserCreation, releaseSeatsAfterTimeout, etc.
});