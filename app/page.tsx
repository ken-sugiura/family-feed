import { Workspace } from "@/components/workspace/Workspace";
import workspaceData from "@/data/workspace.json";
import { supabase } from "@/lib/supabase";
import {
  childrenSchema,
  categoriesSchema,
  eventsSchema,
  workspaceSchema,
  type Child,
  type Category,
  type FamilyEvent,
} from "@/lib/schema";

export default async function Page() {
  const wsResult = workspaceSchema.safeParse(workspaceData);
  if (!wsResult.success) {
    throw new Error(`workspace.json: ${wsResult.error.issues[0]?.message}`);
  }

  // Supabase からデータを取得
  const [{ data: rawChildren }, { data: rawCategories }, { data: rawEvents }] =
    await Promise.all([
      supabase.from("children").select("*").order("sort_order"),
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false }),
    ]);

  // DB のスネークケースを Zod スキーマのキャメルケースに変換
  const childrenMapped: unknown[] = (rawChildren ?? []).map(
    (r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      birthdate: r.birthdate ?? "",
    }),
  );

  const categoriesMapped: unknown[] = (rawCategories ?? []).map(
    (r: Record<string, unknown>) => ({
      id: r.id,
      label: r.label,
      emoji: r.emoji,
    }),
  );

  const eventsMapped: unknown[] = (rawEvents ?? []).map(
    (r: Record<string, unknown>) => ({
      id: r.id,
      date: r.date,
      imageUrl: r.image_url ?? undefined,
      caption: r.caption,
      memo: r.memo ?? undefined,
      height: r.height ?? undefined,
      weight: r.weight ?? undefined,
      childIds: r.child_ids ?? [],
      categoryIds: r.category_ids ?? [],
    }),
  );

  const childrenResult = childrenSchema.safeParse(childrenMapped);
  const categoriesResult = categoriesSchema.safeParse(categoriesMapped);
  const eventsResult = eventsSchema.safeParse(eventsMapped);

  if (!childrenResult.success || !categoriesResult.success || !eventsResult.success) {
    const errors = [
      !childrenResult.success && `children: ${childrenResult.error.issues[0]?.message}`,
      !categoriesResult.success && `categories: ${categoriesResult.error.issues[0]?.message}`,
      !eventsResult.success && `events: ${eventsResult.error.issues[0]?.message}`,
    ].filter(Boolean);
    throw new Error(`Supabase データの形式が正しくありません:\n${errors.join("\n")}`);
  }

  return (
    <Workspace
      initialChildren={childrenResult.data as Child[]}
      initialCategories={categoriesResult.data as Category[]}
      initialEvents={eventsResult.data as FamilyEvent[]}
      workspace={wsResult.data}
    />
  );
}
