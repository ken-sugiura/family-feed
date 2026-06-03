"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, MoreHorizontal, Pencil, GripVertical, X } from "lucide-react";

import { type Child, type Category, type FamilyEvent } from "@/lib/schema";
import { ALL_CHILDREN_LABEL, ALL_CATEGORIES_LABEL } from "@/lib/labels";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";
import { EditItemDialog } from "@/components/workspace/EditItemDialog";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";

// ===== SortablePersonItem =====

type SortablePersonItemProps = {
  child: Child;
  count: number;
  isSelected: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

function SortablePersonItem({
  child,
  count,
  isSelected,
  onToggle,
  onDelete,
}: SortablePersonItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: child.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <SidebarMenuButton isActive={isSelected} onClick={onToggle}>
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3" />
        </span>
        <span>{child.emoji}</span>
        <span className="truncate">{child.name}</span>
        {count > 0 && (
          <Badge variant="secondary" className="ml-auto shrink-0 tabular-nums">
            {count}
          </Badge>
        )}
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover>
              <MoreHorizontal />
              <span className="sr-only">操作</span>
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 />
              削除
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

// ===== SortableCategoryItem =====

type SortableCategoryItemProps = {
  category: Category;
  isSelected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function SortableCategoryItem({
  category,
  isSelected,
  onToggle,
  onEdit,
  onDelete,
}: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <SidebarMenuButton isActive={isSelected} onClick={onToggle}>
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3" />
        </span>
        <span>{category.emoji}</span>
        <span className="truncate">{category.label}</span>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover>
              <MoreHorizontal />
              <span className="sr-only">操作</span>
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil />
              編集
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 />
              削除
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

// ===== FamilyPane =====

type FamilyPaneProps = {
  workspaceName: string;
  children: Child[];
  categories: Category[];
  events: FamilyEvent[];
  selectedPersonIds: string[];
  selectedCategoryIds: string[];
  onTogglePerson: (id: string) => void;
  onToggleCategory: (id: string) => void;
  onClearFilters: () => void;
  onClearPersonFilters: () => void;
  onClearCategoryFilters: () => void;
  onAddChild: (name: string, emoji: string) => void;
  onDeleteChild: (id: string) => void;
  onReorderChildren: (newOrder: Child[]) => void;
  onAddCategory: (label: string, emoji: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategory: (id: string, patch: Partial<Category>) => void;
  onReorderCategories: (newOrder: Category[]) => void;
};

export function FamilyPane({
  workspaceName,
  children,
  categories,
  events,
  selectedPersonIds,
  selectedCategoryIds,
  onTogglePerson,
  onToggleCategory,
  onClearFilters,
  onClearPersonFilters,
  onClearCategoryFilters,
  onAddChild,
  onDeleteChild,
  onReorderChildren,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
  onReorderCategories,
}: FamilyPaneProps) {
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [deleteChildTarget, setDeleteChildTarget] = useState<Child | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<Category | null>(null);
  const [editCategoryTarget, setEditCategoryTarget] = useState<Category | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // 各人物のイベント件数（全件から集計）
  const personEventCount = (childId: string) =>
    events.filter((e) => e.childIds.includes(childId)).length;

  const hasActiveFilter =
    selectedPersonIds.length > 0 || selectedCategoryIds.length > 0;

  function handlePersonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = children.findIndex((c) => c.id === active.id);
    const newIndex = children.findIndex((c) => c.id === over.id);
    onReorderChildren(arrayMove(children, oldIndex, newIndex));
  }

  function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    onReorderCategories(arrayMove(categories, oldIndex, newIndex));
  }

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
      >
        <SidebarHeader className="border-b border-sidebar-border p-0">
          <div className="flex h-12 items-center justify-between gap-2 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[state=expanded]:px-5">
            <h2 className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              {workspaceName}
            </h2>
            <Pane1Toggle />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-1 py-3 group-data-[collapsible=icon]:hidden">
          {/* フィルタークリアボタン */}
          {hasActiveFilter && (
            <div className="px-3 pb-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-full justify-start gap-1.5 text-xs text-muted-foreground"
                onClick={onClearFilters}
              >
                <X className="size-3" />
                フィルタークリア
              </Button>
            </div>
          )}

          {/* 人物セレクタ */}
          <SidebarGroup className="px-1">
            <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
              人物
            </SidebarGroupLabel>
            <SidebarGroupAction
              title="人物を追加"
              onClick={() => setAddChildOpen(true)}
              className="w-6 rounded-[min(var(--radius-md),10px)] text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-3"
            >
              <Plus />
              <span className="sr-only">人物を追加</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={selectedPersonIds.length === 0}
                    onClick={onClearPersonFilters}
                  >
                    <span>👨‍👩‍👦</span>
                    <span className="truncate">{ALL_CHILDREN_LABEL}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <DndContext
                  id="person-dnd"
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handlePersonDragEnd}
                >
                  <SortableContext
                    items={children.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {children.map((child) => (
                      <SortablePersonItem
                        key={child.id}
                        child={child}
                        count={personEventCount(child.id)}
                        isSelected={selectedPersonIds.includes(child.id)}
                        onToggle={() => onTogglePerson(child.id)}
                        onDelete={() => setDeleteChildTarget(child)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* カテゴリフィルター */}
          <SidebarGroup className="px-1">
            <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
              カテゴリ
            </SidebarGroupLabel>
            <SidebarGroupAction
              title="カテゴリを追加"
              onClick={() => setAddCategoryOpen(true)}
              className="w-6 rounded-[min(var(--radius-md),10px)] text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-3"
            >
              <Plus />
              <span className="sr-only">カテゴリを追加</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={selectedCategoryIds.length === 0}
                    onClick={onClearCategoryFilters}
                  >
                    <span>📋</span>
                    <span className="truncate">{ALL_CATEGORIES_LABEL}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <DndContext
                  id="category-dnd"
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCategoryDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((cat) => (
                      <SortableCategoryItem
                        key={cat.id}
                        category={cat}
                        isSelected={selectedCategoryIds.includes(cat.id)}
                        onToggle={() => onToggleCategory(cat.id)}
                        onEdit={() => setEditCategoryTarget(cat)}
                        onDelete={() => setDeleteCategoryTarget(cat)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* 人物追加ダイアログ */}
      <AddItemDialog
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        title="人物を追加"
        description="家族の名前と絵文字を入力してください"
        fieldLabel="名前（例: 三男、母）"
        fieldId="child-name"
        placeholder="例: 三男"
        onAdd={(name) => onAddChild(name, "👤")}
      />

      {/* カテゴリ追加ダイアログ */}
      <AddItemDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        title="カテゴリを追加"
        description="新しいカテゴリのラベルを入力してください"
        fieldLabel="カテゴリ名（例: 旅行）"
        fieldId="category-label"
        placeholder="例: 旅行"
        onAdd={(label) => onAddCategory(label, "📌")}
      />

      {/* カテゴリ編集ダイアログ */}
      <EditItemDialog
        open={editCategoryTarget !== null}
        onOpenChange={(open) => { if (!open) setEditCategoryTarget(null); }}
        title="カテゴリを編集"
        description="カテゴリの名前と絵文字を変更できます"
        initialLabel={editCategoryTarget?.label ?? ""}
        initialEmoji={editCategoryTarget?.emoji ?? ""}
        onSave={(label, emoji) => {
          if (editCategoryTarget) {
            onUpdateCategory(editCategoryTarget.id, { label, emoji });
            setEditCategoryTarget(null);
          }
        }}
      />

      {/* 人物削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={deleteChildTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteChildTarget(null); }}
        title="人物を削除しますか？"
        itemName={deleteChildTarget?.name ?? ""}
        onConfirm={() => {
          if (deleteChildTarget) {
            onDeleteChild(deleteChildTarget.id);
            setDeleteChildTarget(null);
          }
        }}
      />

      {/* カテゴリ削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={deleteCategoryTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteCategoryTarget(null); }}
        title="カテゴリを削除しますか？"
        itemName={deleteCategoryTarget?.label ?? ""}
        onConfirm={() => {
          if (deleteCategoryTarget) {
            onDeleteCategory(deleteCategoryTarget.id);
            setDeleteCategoryTarget(null);
          }
        }}
      />
    </>
  );
}
