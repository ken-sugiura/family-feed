"use client";

/**
 * EventDetailPane — イベント詳細表示 + インライン編集（Pane 3）。
 *
 * [設計メモ] workspace-design.mdc は「Pane 3 = 閲覧 / Pane 4 = 編集」を原則とするが、
 * ファミリーフィードではユーザーが投稿と同時に詳細を確認・修正する UX が中心のため、
 * このペインに InlineTextField 等の編集 UI を置くことを意図的に選択している。
 * Pane 4 は AI サマリー専用として責務を分離済み。
 */

import { Image } from "lucide-react";

import {
  type FamilyEvent,
  type Child,
  type Category,
} from "@/lib/schema";
import { PANE3_FIELD_LABELS, PANE3_SECTION } from "@/lib/labels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { InlineFieldRow } from "@/components/primitives/InlineFieldRow";
import { InlineTextField } from "@/components/primitives/InlineTextField";
import { InlineTextareaField } from "@/components/primitives/InlineTextareaField";
import { InlineDateField } from "@/components/primitives/InlineDateField";

type EventDetailPaneProps = {
  event: FamilyEvent | null;
  children: Child[];
  categories: Category[];
  onUpdateEvent: (id: string, patch: Partial<FamilyEvent>) => void;
};

export function EventDetailPane({
  event,
  children,
  categories,
  onUpdateEvent,
}: EventDetailPaneProps) {
  const childMap = Object.fromEntries(children.map((c) => [c.id, c]));
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  if (!event) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-canvas text-muted-foreground">
        <span className="text-3xl">📸</span>
        <p className="text-sm">左のタイムラインからイベントを選択してください</p>
      </div>
    );
  }

  const patch = (field: keyof FamilyEvent) => (value: string) =>
    onUpdateEvent(event.id, { [field]: value });

  // imageUrl は空文字を undefined として保存する（スキーマの transform と同様に正規化）
  const patchImageUrl = (value: string) =>
    onUpdateEvent(event.id, { imageUrl: value.trim() || undefined });

  const patchNumber =
    (field: "height" | "weight") => (value: string) => {
      const num = parseFloat(value);
      onUpdateEvent(event.id, { [field]: isNaN(num) ? undefined : num });
    };

  const eventChildren = event.childIds
    .map((id) => childMap[id])
    .filter(Boolean);
  const eventCategories = event.categoryIds
    .map((id) => categoryMap[id])
    .filter(Boolean);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-canvas">
      {/* ヘッダー */}
      <div className="flex h-12 shrink-0 items-center border-b border-border px-5">
        <span className="truncate text-sm font-semibold text-foreground">
          イベント詳細
        </span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 p-5">
          {/* 写真 */}
          {event.imageUrl ? (
            <div className="overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.imageUrl}
                alt={event.caption}
                className="h-56 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement
                    ?.classList.add("flex", "h-32", "items-center", "justify-center");
                }}
              />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
              <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <Image className="size-6" />
                <span className="text-xs">写真 URL を入力すると表示されます</span>
              </div>
            </div>
          )}

          {/* 基本情報 */}
          <section className="flex flex-col gap-3">
            <SectionLabel>{PANE3_SECTION.basic}</SectionLabel>
            <dl className="flex flex-col gap-3 text-sm">
              <InlineFieldRow label={PANE3_FIELD_LABELS.date}>
                <InlineDateField
                  value={event.date}
                  onSave={patch("date")}
                  ariaLabel={PANE3_FIELD_LABELS.date}
                />
              </InlineFieldRow>

              <InlineFieldRow label={PANE3_FIELD_LABELS.imageUrl}>
                <InlineTextField
                  value={event.imageUrl ?? ""}
                  onSave={patchImageUrl}
                  ariaLabel={PANE3_FIELD_LABELS.imageUrl}
                  placeholder="https://..."
                />
              </InlineFieldRow>

              <InlineFieldRow label={PANE3_FIELD_LABELS.caption}>
                <InlineTextField
                  value={event.caption}
                  onSave={patch("caption")}
                  ariaLabel={PANE3_FIELD_LABELS.caption}
                  placeholder="一言キャプション"
                />
              </InlineFieldRow>

              {/* 子どもタグ */}
              <div className="flex flex-col gap-1.5">
                <dt className="text-sm text-muted-foreground">
                  {PANE3_FIELD_LABELS.childIds}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {children.map((child) => {
                    const isTagged = event.childIds.includes(child.id);
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          const next = isTagged
                            ? event.childIds.filter((id) => id !== child.id)
                            : [...event.childIds, child.id];
                          onUpdateEvent(event.id, { childIds: next });
                        }}
                        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Badge
                          variant={isTagged ? "default" : "secondary"}
                          className="cursor-pointer"
                        >
                          {child.emoji} {child.name}
                        </Badge>
                      </button>
                    );
                  })}
                </dd>
              </div>

              {/* カテゴリタグ */}
              <div className="flex flex-col gap-1.5">
                <dt className="text-sm text-muted-foreground">
                  {PANE3_FIELD_LABELS.categoryIds}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const isTagged = event.categoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const next = isTagged
                            ? event.categoryIds.filter((id) => id !== cat.id)
                            : [...event.categoryIds, cat.id];
                          onUpdateEvent(event.id, { categoryIds: next });
                        }}
                        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Badge
                          variant={isTagged ? "default" : "secondary"}
                          className="cursor-pointer"
                        >
                          {cat.emoji} {cat.label}
                        </Badge>
                      </button>
                    );
                  })}
                </dd>
              </div>

              <InlineFieldRow label={PANE3_FIELD_LABELS.memo}>
                <InlineTextareaField
                  value={event.memo ?? ""}
                  onSave={patch("memo")}
                  ariaLabel={PANE3_FIELD_LABELS.memo}
                  placeholder="詳細メモ（Cmd+Enter で保存）"
                />
              </InlineFieldRow>
            </dl>
          </section>

          <Separator />

          {/* 成長記録 */}
          <section className="flex flex-col gap-3">
            <SectionLabel>{PANE3_SECTION.growth}</SectionLabel>
            <dl className="flex flex-col gap-3 text-sm">
              <InlineFieldRow label={PANE3_FIELD_LABELS.height}>
                <InlineTextField
                  value={event.height != null ? String(event.height) : ""}
                  onSave={patchNumber("height")}
                  ariaLabel={PANE3_FIELD_LABELS.height}
                  inputType="number"
                  placeholder="例: 112.5"
                  className="w-32"
                />
              </InlineFieldRow>

              <InlineFieldRow label={PANE3_FIELD_LABELS.weight}>
                <InlineTextField
                  value={event.weight != null ? String(event.weight) : ""}
                  onSave={patchNumber("weight")}
                  ariaLabel={PANE3_FIELD_LABELS.weight}
                  inputType="number"
                  placeholder="例: 19.5"
                  className="w-32"
                />
              </InlineFieldRow>
            </dl>

            {/* タグ済みの子どもの成長数値サマリー */}
            {eventChildren.length > 0 && (event.height || event.weight) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {eventChildren.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs"
                  >
                    <span>{child.emoji}</span>
                    <span className="font-medium">{child.name}</span>
                    {event.height && (
                      <span className="text-muted-foreground">
                        {event.height} cm
                      </span>
                    )}
                    {event.weight && (
                      <span className="text-muted-foreground">
                        {event.weight} kg
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
