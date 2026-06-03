/**
 * ファミリーフィード ドメインの Zod スキーマと派生型。
 * UI コンポーネントはここから型をインポートする。
 */

import { z } from "zod";

// ===== Pane 1: 子ども =====

/** 子ども一人の情報。Pane 1 の子どもセレクタに表示する単位。 */
export const childSchema = z.object({
  id: z.string(),
  name: z.string(),        // 例: 長男、次男
  emoji: z.string(),       // 例: 👦
  birthdate: z.string(),   // YYYY-MM-DD
});
export type Child = z.infer<typeof childSchema>;

// ===== Pane 1: イベントカテゴリ =====

/** イベントカテゴリ。Pane 1 のフィルターと Pane 3 のタグに使う。 */
export const categorySchema = z.object({
  id: z.string(),
  label: z.string(),   // 例: 誕生日
  emoji: z.string(),   // 例: 🎂
});
export type Category = z.infer<typeof categorySchema>;

// ===== Pane 2/3: イベント =====

/**
 * 家族イベント。Pane 2 のタイムラインの1行 = Pane 3 の詳細の1件。
 *
 * - date: YYYY-MM-DD 形式
 * - imageUrl: Amazon Photos 共有リンクなど外部 URL（省略可）
 * - caption: 一言キャプション（投稿本文の先頭行）
 * - childIds: タグ付けされた子ども（複数可）
 * - categoryIds: カテゴリタグ（複数可）
 * - memo: 詳細メモ（複数行、省略可）
 * - height: 身長 cm（省略可）
 * - weight: 体重 kg（省略可）
 */
export const familyEventSchema = z.object({
  id: z.string(),
  /** YYYY-MM-DD 形式。空文字・不正フォーマットは拒否する。 */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date は YYYY-MM-DD 形式で入力してください"),
  /**
   * 外部画像 URL（Amazon Photos の共有リンク等）。
   * 空文字はパース時に undefined として正規化する。
   */
  imageUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional(),
  ),
  caption: z.string().min(1, "一言キャプションは必須です"),
  childIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  memo: z.string().optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
});
export type FamilyEvent = z.infer<typeof familyEventSchema>;

// ===== Workspace =====

export const workspaceSchema = z.object({
  name: z.string(),
  icon: z.string(),
});
export type WorkspaceConfig = z.infer<typeof workspaceSchema>;

// ===== JSON 全体用スキーマ =====

export const childrenSchema = z.array(childSchema);
export const categoriesSchema = z.array(categorySchema);
export const eventsSchema = z.array(familyEventSchema);

// ===== Pane 2 の表示用派生型 =====

/** Pane 2 タイムラインの1行表示用型。 */
export type EventRow = {
  id: string;
  date: string;
  caption: string;
  imageUrl?: string;
  childIds: string[];
  categoryIds: string[];
};

/** Pane 2 の月グループ。イベントを月単位でまとめる。 */
export type MonthGroup = {
  month: string;   // "2026-05"
  label: string;   // "2026年5月"
  items: EventRow[];
};

// ===== Pane 3/4 の表示状態 =====

/**
 * Pane 3 に「何を開いているか」を表す型。
 * - string: イベント ID → Pane 3 でそのイベント詳細を表示
 * - null: 未選択（Pane 3 は空状態）
 */
export type SelectedEventId = string | null;
