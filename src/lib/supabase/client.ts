import { createBrowserClient } from "@supabase/ssr";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// middleware.ts creates an anonymous session for first-time visitors, but the
// browser client can occasionally ask before that session has been picked up
// (e.g. right after the tab was backgrounded for the native camera picker).
// Self-heal here instead of failing the action: sign in anonymously on the
// spot rather than telling the user to "try again in a moment".
export async function ensureUser(
  supabase: SupabaseClient<Database>
): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) return null;
  return data.user;
}
