import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pyuzizwksoczdrniqaqh.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_QkTbP6cD6r2ilvoZV6TN2g_czJmJGhA";

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);

export default createClient;
