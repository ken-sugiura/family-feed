/**
 * ファミリーフィード の表示文言（labels）。
 *
 * 業種・用途を変える際は、このファイルの値を書き換える。
 */

// ===== Pane 2 の月グループ見出し生成 =====

/** "2026-05" → "2026年5月" に変換するヘルパー */
export function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  return `${year}年${parseInt(m, 10)}月`;
}

// ===== Pane 1 フィルター =====

/** 子どもフィルターで「すべて」を表すラベル */
export const ALL_CHILDREN_LABEL = "すべて";

/** カテゴリフィルターで「すべて」を表すラベル */
export const ALL_CATEGORIES_LABEL = "すべて";

// ===== Pane 3 フィールドラベル =====

export const PANE3_FIELD_LABELS = {
  date: "日付",
  imageUrl: "写真 URL",
  caption: "一言",
  childIds: "子ども",
  categoryIds: "カテゴリ",
  memo: "メモ",
  height: "身長 (cm)",
  weight: "体重 (kg)",
} as const;

// ===== Pane 3 セクション見出し =====

export const PANE3_SECTION = {
  basic: "基本情報",
  growth: "成長記録",
} as const;

// ===== Pane 4 プレースホルダー =====

export const PANE4_PLACEHOLDER = {
  title: "AI 月次サマリー",
  highlightTitle: "今月のハイライト",
  albumTitle: "年次アルバム",
  comingSoon: "AI サマリー機能は近日公開予定です",
} as const;
