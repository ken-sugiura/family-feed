"use client";

import { type Child, type Category, type FamilyEvent } from "@/lib/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MobileFilterPaneProps = {
  children: Child[];
  categories: Category[];
  events: FamilyEvent[];
  selectedPersonIds: string[];
  selectedCategoryIds: string[];
  onTogglePerson: (id: string) => void;
  onToggleCategory: (id: string) => void;
  onClearFilters: () => void;
};

export function MobileFilterPane({
  children,
  categories,
  events,
  selectedPersonIds,
  selectedCategoryIds,
  onTogglePerson,
  onToggleCategory,
  onClearFilters,
}: MobileFilterPaneProps) {
  const personEventCount = (childId: string) =>
    events.filter((e) => e.childIds.includes(childId)).length;

  const hasFilters =
    selectedPersonIds.length > 0 || selectedCategoryIds.length > 0;

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-5 pb-24">
        {/* フィルタークリアボタン */}
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="self-start"
          >
            フィルターをクリア
          </Button>
        )}

        {/* 人物 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            人物
          </h2>
          <div className="flex flex-wrap gap-2">
            {children.map((child) => {
              const isSelected = selectedPersonIds.includes(child.id);
              const count = personEventCount(child.id);
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onTogglePerson(child.id)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    backgroundColor: isSelected
                      ? "hsl(var(--primary))"
                      : undefined,
                    color: isSelected ? "hsl(var(--primary-foreground))" : undefined,
                    borderColor: isSelected ? "hsl(var(--primary))" : undefined,
                  }}
                >
                  <span>{child.emoji}</span>
                  <span>{child.name}</span>
                  {count > 0 && (
                    <Badge
                      variant={isSelected ? "outline" : "secondary"}
                      className="tabular-nums"
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* カテゴリ */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            カテゴリ
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    backgroundColor: isSelected
                      ? "hsl(var(--primary))"
                      : undefined,
                    color: isSelected
                      ? "hsl(var(--primary-foreground))"
                      : undefined,
                    borderColor: isSelected
                      ? "hsl(var(--primary))"
                      : undefined,
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
