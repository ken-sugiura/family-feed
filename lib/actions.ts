"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { type Child, type Category, type FamilyEvent } from "@/lib/schema";

// ===== イベント =====

export async function addEventAction(event: FamilyEvent) {
  await supabase.from("events").insert({
    id: event.id,
    date: event.date,
    image_url: event.imageUrl ?? null,
    caption: event.caption,
    memo: event.memo ?? null,
    height: event.height ?? null,
    weight: event.weight ?? null,
    child_ids: event.childIds,
    category_ids: event.categoryIds,
  });
  revalidatePath("/");
}

export async function updateEventAction(
  id: string,
  patch: Partial<FamilyEvent>,
) {
  const update: Record<string, unknown> = {};
  if (patch.date !== undefined) update.date = patch.date;
  if (patch.imageUrl !== undefined) update.image_url = patch.imageUrl ?? null;
  if (patch.caption !== undefined) update.caption = patch.caption;
  if (patch.memo !== undefined) update.memo = patch.memo ?? null;
  if (patch.height !== undefined) update.height = patch.height ?? null;
  if (patch.weight !== undefined) update.weight = patch.weight ?? null;
  if (patch.childIds !== undefined) update.child_ids = patch.childIds;
  if (patch.categoryIds !== undefined) update.category_ids = patch.categoryIds;

  await supabase.from("events").update(update).eq("id", id);
  revalidatePath("/");
}

// ===== 子ども / 人物 =====

export async function addChildAction(child: Child, sortOrder: number) {
  await supabase.from("children").insert({
    id: child.id,
    name: child.name,
    emoji: child.emoji,
    birthdate: child.birthdate,
    sort_order: sortOrder,
  });
  revalidatePath("/");
}

export async function deleteChildAction(id: string) {
  // イベントのタグから除去
  const { data: events } = await supabase
    .from("events")
    .select("id, child_ids")
    .contains("child_ids", [id]);

  if (events && events.length > 0) {
    await Promise.all(
      events.map((e: { id: string; child_ids: string[] }) =>
        supabase
          .from("events")
          .update({ child_ids: e.child_ids.filter((cid: string) => cid !== id) })
          .eq("id", e.id),
      ),
    );
  }

  await supabase.from("children").delete().eq("id", id);
  revalidatePath("/");
}

export async function reorderChildrenAction(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("children").update({ sort_order: index }).eq("id", id),
    ),
  );
  revalidatePath("/");
}

// ===== カテゴリ =====

export async function addCategoryAction(category: Category, sortOrder: number) {
  await supabase.from("categories").insert({
    id: category.id,
    label: category.label,
    emoji: category.emoji,
    sort_order: sortOrder,
  });
  revalidatePath("/");
}

export async function deleteCategoryAction(id: string) {
  // イベントのタグから除去
  const { data: events } = await supabase
    .from("events")
    .select("id, category_ids")
    .contains("category_ids", [id]);

  if (events && events.length > 0) {
    await Promise.all(
      events.map((e: { id: string; category_ids: string[] }) =>
        supabase
          .from("events")
          .update({
            category_ids: e.category_ids.filter((cid: string) => cid !== id),
          })
          .eq("id", e.id),
      ),
    );
  }

  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/");
}

export async function updateCategoryAction(
  id: string,
  patch: Partial<Category>,
) {
  const update: Record<string, unknown> = {};
  if (patch.label !== undefined) update.label = patch.label;
  if (patch.emoji !== undefined) update.emoji = patch.emoji;

  await supabase.from("categories").update(update).eq("id", id);
  revalidatePath("/");
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("categories").update({ sort_order: index }).eq("id", id),
    ),
  );
  revalidatePath("/");
}
