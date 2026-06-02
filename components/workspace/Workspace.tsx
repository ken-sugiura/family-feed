"use client";

/**
 * Workspace: ファミリーフィード 4ペインの親コンポーネント。
 *
 * レイアウト構造:
 * ```
 * <SidebarProvider>
 * ┌─ Sidebar (Pane 1) ─┬─ SidebarInset ─────────────────────────┐
 * │ 子どもセレクタ       │ ┌─ GlobalHeader (h-12) ──────────────┐ │
 * │ カテゴリフィルター   │ └────────────────────────────────────┘ │
 * │                    │ ┌─ Pane2 ─┬─ Pane3 ────┬─ Pane4 ──────┐ │
 * │                    │ │タイムライン│イベント詳細│AI サマリー   │ │
 * └────────────────────┴─┴──────────┴────────────┴──────────────┘
 * ```
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

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    initialEvents[0]?.id ?? null,
  );
  const [pane4Open, setPane4Open] = useState(true);
  const [addEventOpen, setAddEventOpen] = useState(false);

  // フィルター適用済みイベント（子ども軸 + カテゴリ軸）
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedChildId && !e.childIds.includes(selectedChildId)) return false;
      if (selectedCategoryId && !e.categoryIds.includes(selectedCategoryId))
        return false;
      return true;
    });
  }, [events, selectedChildId, selectedCategoryId]);

  // ② フィルター変更後に選択 ID がリスト外になった場合は先頭にフォールバック
  //    （Effect+setState を避け、レンダー時に派生計算する React 19 推奨パターン）
  const resolvedEventId = filteredEvents.some((e) => e.id === selectedEventId)
    ? selectedEventId
    : (filteredEvents[0]?.id ?? null);

  // resolvedEventId は全件から解決（フィルター外イベントを誤表示しない）
  const activeEvent =
    events.find((e) => e.id === resolvedEventId) ?? null;

  // 月グループ（日付降順）
  const monthGroups: MonthGroup[] = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    const groupMap = new Map<string, EventRow[]>();
    for (const e of sorted) {
      const month = e.date.slice(0, 7); // "2026-05"
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

  // 現在表示中の月（最新グループの月、または今月）
  const currentMonth = useMemo(() => {
    if (monthGroups.length > 0) return monthGroups[0].month;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, [monthGroups]);

  // --- イベントハンドラー ---

  const updateEvent = useCallback(
    (id: string, patch: Partial<FamilyEvent>) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
    },
    [],
  );

  const addEvent = useCallback((caption: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const newEvent = createMinimalEvent(today, caption);
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEventId(newEvent.id);
  }, []);

  const addChild = useCallback((name: string, emoji: string) => {
    const newChild: Child = {
      id: `child-${Date.now()}`,
      name,
      emoji,
      birthdate: "",
    };
    setChildren((prev) => [...prev, newChild]);
  }, []);

  const deleteChild = useCallback((id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id));
    setSelectedChildId((prev) => (prev === id ? null : prev));
    // ③ イベントのタグから孤立 ID を除去
    setEvents((prev) =>
      prev.map((e) =>
        e.childIds.includes(id)
          ? { ...e, childIds: e.childIds.filter((cid) => cid !== id) }
          : e,
      ),
    );
  }, []);

  const addCategory = useCallback((label: string, emoji: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      label,
      emoji,
    };
    setCategories((prev) => [...prev, newCat]);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSelectedCategoryId((prev) => (prev === id ? null : prev));
    // ③ イベントのタグから孤立 ID を除去
    setEvents((prev) =>
      prev.map((e) =>
        e.categoryIds.includes(id)
          ? { ...e, categoryIds: e.categoryIds.filter((cid) => cid !== id) }
          : e,
      ),
    );
  }, []);

  const togglePane4 = useCallback(() => setPane4Open((v) => !v), []);

  // ヘッダーのフィルターラベル
  const filterLabel = selectedChildId
    ? (children.find((c) => c.id === selectedChildId)?.name ?? ALL_CHILDREN_LABEL)
    : selectedCategoryId
      ? (categories.find((c) => c.id === selectedCategoryId)?.label ??
        ALL_CHILDREN_LABEL)
      : ALL_CHILDREN_LABEL;

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
          selectedChildId={selectedChildId}
          selectedCategoryId={selectedCategoryId}
          onSelectChild={setSelectedChildId}
          onSelectCategory={setSelectedCategoryId}
          onAddChild={addChild}
          onDeleteChild={deleteChild}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
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
            {/* ① key={resolvedEventId} でイベント切り替え時に非制御 input をリマウント */}
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

      {/* イベント追加ダイアログ */}
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
