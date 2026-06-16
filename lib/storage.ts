import { supabase } from "@/lib/supabase";

/**
 * ファイルを Supabase Storage の "photos" バケットにアップロードし、公開 URL を返す。
 * ブラウザ（Client Component）から直接呼び出す。
 */
export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(`写真のアップロードに失敗しました: ${error.message}`);

  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}
