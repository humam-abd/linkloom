import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from ".";

const supabaseClient = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

export default supabaseClient;
