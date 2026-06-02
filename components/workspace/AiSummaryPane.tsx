"use client";

import { Sparkles, BookOpen } from "lucide-react";

import { type FamilyEvent, type Child } from "@/lib/schema";
import { PANE4_PLACEHOLDER } from "@/lib/labels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pane4Toggle } from "@/components/workspace/Pane4Toggle";

type AiSummaryPaneProps = {
  pane4Open: boolean;
  onTogglePane4: () => void;
  events: FamilyEvent[];
  children: Child[];
  currentMonth: string; // "2026-05"
};

export function AiSummaryPane({
  pane4Open,
  onTogglePane4,
  events,
  children,
  currentMonth,
}: AiSummaryPaneProps) {
  const childMap = Object.fromEntries(children.map((c) => [c.id, c]));

  // 現在月のイベントをハイライト候補として取得
  const monthEvents = events
    .filter((e) => e.date.startsWith(currentMonth))
    .slice(0, 3);

  return (
    <div
      className={[
        "flex shrink-0 flex-col border-l border-border bg-background transition-all duration-200",
        pane4Open ? "w-72" : "w-0 overflow-hidden",
      ].join(" ")}
    >
      {pane4Open && (
        <>
          {/* ヘッダー */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {PANE4_PLACEHOLDER.title}
              </span>
            </div>
            <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-4 p-4">
              {/* 今月のハイライト */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="size-3.5 text-primary" />
                    {PANE4_PLACEHOLDER.highlightTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {monthEvents.length > 0 ? (
                    monthEvents.map((event) => {
                      const eventChildren = event.childIds
                        .map((id) => childMap[id])
                        .filter(Boolean);
                      return (
                        <div
                          key={event.id}
                          className="flex flex-col gap-1 rounded-md bg-muted/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-1.5">
                            {eventChildren.map((c) => (
                              <span key={c.id} className="text-xs">
                                {c.emoji}
                              </span>
                            ))}
                            <span className="text-xs text-muted-foreground">
                              {formatShortDate(event.date)}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs leading-relaxed text-foreground">
                            {event.caption}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      今月のイベントはまだありません
                    </p>
                  )}

                  {/* AI コメントのプレースホルダー */}
                  <div className="mt-2 rounded-md border border-dashed border-border px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {PANE4_PLACEHOLDER.comingSoon}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                      <Skeleton className="h-3 w-3/5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 年次アルバム */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BookOpen className="size-3.5 text-primary" />
                    {PANE4_PLACEHOLDER.albumTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="rounded-md border border-dashed border-border px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      📖 年末に自動生成されます
                    </p>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    1年間の思い出を自動でまとめてフォトブックを作成します。
                    AI サマリー機能は近日公開予定です。
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </>
      )}

      {!pane4Open && (
        <div className="flex h-full items-start justify-center pt-3">
          <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
        </div>
      )}
    </div>
  );
}

function formatShortDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}
