import { type FamilyEvent } from "@/lib/schema";

/**
 * 新規イベント追加ダイアログから呼ばれる最小イベント生成ヘルパー。
 * 日付と一言キャプションだけ設定し、他は空。
 */
export function createMinimalEvent(
  date: string,
  caption: string,
): FamilyEvent {
  return {
    id: `e-${Date.now()}`,
    date,
    caption,
    childIds: [],
    categoryIds: [],
  };
}
