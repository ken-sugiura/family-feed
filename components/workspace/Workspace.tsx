"use client";

/**
 * Workspace: ファミリーフィード 4ペインの親コンポーネント。
 *
 * レイアウト構造:
 * ```
 * <SidebarProvider>
 * ┌─ Sidebar (Pane 1) ─┬─ SidebarInset ─────────────────────────┐
 * │ 人物セレクタ         │ ┌─ GlobalHeader (h-12) ──────────────┐ │
 * │ カテゴリフィルター   │ └────────────────────────────────────┘ │
 * │                    │ ┌─ Pane2 ─┬─ Pane3 ────┬─ Pane4 ──────┐ │
 * │                    │ │タイムライン│イベント詳細│AI サマリー   │ │
 * └────────────────────┴─┴──────────┴────────────┴──────────────┘
 * ```
 *
 * フィルターロジック: (人物 OR) AND (カテゴリ OR)
 * 例: 選択 = [長男, 次男] × [初めて, 記念日]
 *   → (長男 or 次男が含まれる) AND (初めて or 記念日が含まれる) イベント
 */

import { useState, useCallback, useMemo } from "react";

import {
  type Child,
  type Category,
  type FamilyEvent,
  type WorkspaceConfig,
  type MonthGroup,
  type EventRow,
} from "@/lib/schema";
import { formatMonthLabel, ALL_CHILDREN_LABEL } from "@/lib/labels";
import { createMinimalEvent } from "@/lib/data/factories";
import {
  addEventAction,
  updateEventAction,
  addChildAction,
  deleteChildAction,
  reorderChildrenAction,
  addCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  reorderCategoriesAction,
} from "@/lib/actions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { GlobalHeader } from "@/components/workspace/GlobalHeader";
import { FamilyPane } from "@/components/workspace/FamilyPane";
import { EventListPane } from "@/components/workspace/EventListPane";
import { EventDetailPane } from "@/components/workspace/EventDetailPane";
import { AiSummaryPane } from "@/components/workspace/AiSummaryPane";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";

type WorkspaceProps = {
  initialChildren: Child[];
  initialCategories: Category[];
  initialEvents: FamilyEvent[];
  workspace: WorkspaceConfig;
};

export function Workspace({
  initialChildren,
  initialCategories,
  initialEvents,
  workspace,
}: WorkspaceProps) {
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [events, setEvents] = useState<FamilyEvent[]>(initialEvents);

  // 複数選択フィルター: 空配列 = すべて
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    initialEvents[0]?.id ?? null,
  );
  const [pane4Open, setPane4Open] = useState(true);
  const [addEventOpen, setAddEventOpen] = useState(false);

  // フィルター適用済みイベント: (人物 OR) AND (カテゴリ OR)
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const personMatch =
        selectedPersonIds.length === 0 ||
        selectedPersonIds.some((id) => e.childIds.includes(id));
      const categoryMatch =
        selectedCategoryIds.length === 0 ||
        selectedCategoryIds.some((id) => e.categoryIds.includes(id));
      return personMatch && categoryMatch;
    });
  }, [events, selectedPersonIds, selectedCategoryIds]);

  // フィルター変更後に選択 ID がリスト外になった場合は先頭にフォールバック
  // （Effect+setState を避け、レンダー時に派生計算する React 19 推奨パターン）
  const resolvedEventId = filteredEvents.some((e) => e.id === selectedEventId)
    ? selectedEventId
    : (filteredEvents[0]?.id ?? null);

  const activeEvent = events.find((e) => e.id === resolvedEventId) ?? null;

  // 月グループ（日付降順）
  const monthGroups: MonthGroup[] = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    const groupMap = new Map<string, EventRow[]>();
    for (const e of sorted) {
      const month = e.date.slice(0, 7);
      if (!groupMap.has(month)) groupMap.set(month, []);
      groupMap.get(month)!.push({
        id: e.id,
        date: e.date,
        caption: e.caption,
        imageUrl: e.imageUrl,
        childIds: e.childIds,
        categoryIds: e.categoryIds,
      });
    }

    return Array.from(groupMap.entries()).map(([month, items]) => ({
      month,
      label: formatMonthLabel(month),
      items,
    }));
  }, [filteredEvents]);

  const currentMonth = useMemo(() => {
    if (monthGroups.length > 0) return monthGroups[0].month;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, [monthGroups]);

  // --- フィルターハンドラー ---

  const togglePerson = useCallback((id: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedPersonIds([]);
    setSelectedCategoryIds([]);
  }, []);

  const clearPersonFilters = useCallback(() => setSelectedPersonIds([]), []);
  const clearCategoryFilters = useCallback(() => setSelectedCategoryIds([]), []);

  // --- イベントハンドラー ---

  const updateEvent = useCallback(
    (id: string, patch: Partial<FamilyEvent>) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
      // 楽観的更新後に DB へ反映
      void updateEventAction(id, patch);
    },
    [],
  );

  const addEvent = useCallback(
    (caption: string) => {
      const today = new Date().toISOString().slice(0, 10);
      const newEvent = createMinimalEvent(today, caption);
      if (selectedPersonIds.length > 0) newEvent.childIds = selectedPersonIds;
      if (selectedCategoryIds.length > 0) newEvent.categoryIds = selectedCategoryIds;
      setEvents((prev) => [newEvent, ...prev]);
      setSelectedEventId(newEvent.id);
      void addEventAction(newEvent);
    },
    [selectedPersonIds, selectedCategoryIds],
  );

  // --- 人物ハンドラー ---

  const addChild = useCallback(
    (name: string, emoji: string) => {
      const newChild: Child = {
        id: `child-${Date.now()}`,
        name,
        emoji,
        birthdate: "",
      };
      setChildren((prev) => {
        void addChildAction(newChild, prev.length);
        return [...prev, newChild];
      });
    },
    [],
  );

  const deleteChild = useCallback((id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id));
    setSelectedPersonIds((prev) => prev.filter((x) => x !== id));
    setEvents((prev) =>
      prev.map((e) =>
        e.childIds.includes(id)
          ? { ...e, childIds: e.childIds.filter((cid) => cid !== id) }
          : e,
      ),
    );
    void deleteChildAction(id);
  }, []);

  const reorderChildren = useCallback((newOrder: Child[]) => {
    setChildren(newOrder);
    void reorderChildrenAction(newOrder.map((c) => c.id));
  }, []);

  // --- カテゴリハンドラー ---

  const addCategory = useCallback(
    (label: string, emoji: string) => {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        label,
        emoji,
      };
      setCategories((prev) => {
        void addCategoryAction(newCat, prev.length);
        return [...prev, newCat];
      });
    },
    [],
  );

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSelectedCategoryIds((prev) => prev.filter((x) => x !== id));
    setEvents((prev) =>
      prev.map((e) =>
        e.categoryIds.includes(id)
          ? { ...e, categoryIds: e.categoryIds.filter((cid) => cid !== id) }
          : e,
      ),
    );
    void deleteCategoryAction(id);
  }, []);

  const updateCategory = useCallback(
    (id: string, patch: Partial<Category>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );
      void updateCategoryAction(id, patch);
    },
    [],
  );

  const reorderCategories = useCallback((newOrder: Category[]) => {
    setCategories(newOrder);
    void reorderCategoriesAction(newOrder.map((c) => c.id));
  }, []);

  const togglePane4 = useCallback(() => setPane4Open((v) => !v), []);

  // ヘッダーのフィルターラベル（複数選択対応）
  const filterLabel = useMemo(() => {
    const personLabels = selectedPersonIds.map(
      (id) => children.find((c) => c.id === id)?.name ?? id,
    );
    const catLabels = selectedCategoryIds.map(
      (id) => categories.find((c) => c.id === id)?.label ?? id,
    );
    const all = [...personLabels, ...catLabels];
    return all.length === 0 ? ALL_CHILDREN_LABEL : all.join(" · ");
  }, [selectedPersonIds, selectedCategoryIds, children, categories]);

  return (
    <>
      <SidebarProvider
        defaultOpen
        className="h-screen w-full overflow-hidden bg-background text-foreground"
      >
        <FamilyPane
          workspaceName={workspace.name}
          children={children}
          categories={categories}
          events={events}
          selectedPersonIds={selectedPersonIds}
          selectedCategoryIds={selectedCategoryIds}
          onTogglePerson={togglePerson}
          onToggleCategory={toggleCategory}
          onClearFilters={clearFilters}
          onClearPersonFilters={clearPersonFilters}
          onClearCategoryFilters={clearCategoryFilters}
          onAddChild={addChild}
          onDeleteChild={deleteChild}
          onReorderChildren={reorderChildren}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onUpdateCategory={updateCategory}
          onReorderCategories={reorderCategories}
        />
        <SidebarInset className="flex min-w-0 flex-col bg-background">
          <GlobalHeader
            workspaceName={workspace.name}
            filterLabel={filterLabel}
            eventCaption={activeEvent?.caption ?? "（イベント未選択）"}
          />
          <div className="flex min-h-0 flex-1">
            <EventListPane
              groups={monthGroups}
              children={children}
              categories={categories}
              selectedEventId={resolvedEventId}
              onSelectEvent={setSelectedEventId}
              onAddEvent={() => setAddEventOpen(true)}
            />
            {/* key={resolvedEventId} でイベント切り替え時に非制御 input をリマウント */}
            <EventDetailPane
              key={resolvedEventId ?? "empty"}
              event={activeEvent}
              children={children}
              categories={categories}
              onUpdateEvent={updateEvent}
            />
            <AiSummaryPane
              pane4Open={pane4Open}
              onTogglePane4={togglePane4}
              events={filteredEvents}
              children={children}
              currentMonth={currentMonth}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>

      <AddItemDialog
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        title="イベントを追加"
        description="今日のちょっとした出来事を記録しましょう"
        fieldLabel="一言キャプション"
        fieldId="event-caption"
        placeholder="例: 公園で初めて鉄棒できた！"
        onAdd={addEvent}
      />
    </>
  );
}
