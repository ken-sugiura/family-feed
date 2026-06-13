import { createClient } from "@supabase/supabase-js";

/**
 * Supabase クライアント。
 * Server Component / Server Actions / Client Component いずれでも使用可。
 * 認証なし（anon key）の公開アクセス前提。
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
