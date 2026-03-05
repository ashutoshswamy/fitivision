"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createSupabaseClient>;

let client: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}
