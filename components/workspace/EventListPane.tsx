"use client";

import { Plus } from "lucide-react";

import { type MonthGroup, type Child, type Category } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type EventListPaneProps = {
  groups: MonthGroup[];
  children: Child[];
  categories: Category[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  onAddEvent: () => void;
};

export function EventListPane({
  groups,
  children,
  categories,
  selectedEventId,
  onSelectEvent,
  onAddEvent,
}: EventListPaneProps) {
  const childMap = Object.fromEntries(children.map((c) => [c.id, c]));
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const totalCount = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-border bg-background">
      {/* ペインヘッダー */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-semibold text-foreground">
          タイムライン
          <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
            {totalCount}件
          </span>
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onAddEvent}
          title="イベントを追加"
        >
          <Plus className="size-4" />
          <span className="sr-only">イベントを追加</span>
        </Button>
      </div>

      {/* タイムラインリスト */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col py-2">
          {groups.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
              <span className="text-2xl">📸</span>
              <span>まだイベントがありません</span>
              <Button variant="outline" size="sm" onClick={onAddEvent}>
                最初のイベントを追加
              </Button>
            </div>
          )}
          {groups.map((group, groupIndex) => (
            <div key={group.month}>
              {groupIndex > 0 && <Separator className="my-2" />}
              {/* 月ヘッダー */}
              <div className="flex items-center gap-2 px-4 py-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  {group.label}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {group.items.length}件
                </span>
              </div>
              {/* イベント行 */}
              {group.items.map((event) => {
                const isSelected = event.id === selectedEventId;
                const eventChildren = event.childIds
                  .map((id) => childMap[id])
                  .filter(Boolean);
                const eventCategories = event.categoryIds
                  .map((id) => categoryMap[id])
                  .filter(Boolean);

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onSelectEvent(event.id)}
                    className={[
                      "flex w-full flex-col gap-1 px-4 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/60",
                    ].join(" ")}
                  >
                    {/* 日付 + 子どもタグ */}
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatShortDate(event.date)}
                      </span>
                      <div className="flex min-w-0 flex-wrap gap-1">
                        {eventChildren.map((child) => (
                          <span
                            key={child.id}
                            className="shrink-0 text-xs"
                            title={child.name}
                          >
                            {child.emoji}
                          </span>
                        ))}
                        {eventCategories.slice(0, 2).map((cat) => (
                          <Badge
                            key={cat.id}
                            variant="secondary"
                            className="h-4 shrink-0 px-1 py-0 text-[10px]"
                          >
                            {cat.emoji}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {/* キャプション */}
                    <span className="line-clamp-2 text-xs leading-relaxed text-foreground">
                      {event.caption}
                    </span>
                    {/* サムネイル */}
                    {event.imageUrl && (
                      <div className="mt-1 h-20 w-full overflow-hidden rounded-md bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.imageUrl}
                          alt={event.caption}
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/** "2026-05-23" → "5/23" */
function formatShortDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}
