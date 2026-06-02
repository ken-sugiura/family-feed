"use client";

import { useState } from "react";
import { Plus, Trash2, MoreHorizontal } from "lucide-react";

import { type Child, type Category } from "@/lib/schema";
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
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";

type FamilyPaneProps = {
  workspaceName: string;
  children: Child[];
  categories: Category[];
  selectedChildId: string | null;   // null = すべて
  selectedCategoryId: string | null; // null = すべて
  onSelectChild: (id: string | null) => void;
  onSelectCategory: (id: string | null) => void;
  onAddChild: (name: string, emoji: string) => void;
  onDeleteChild: (id: string) => void;
  onAddCategory: (label: string, emoji: string) => void;
  onDeleteCategory: (id: string) => void;
};

export function FamilyPane({
  workspaceName,
  children,
  categories,
  selectedChildId,
  selectedCategoryId,
  onSelectChild,
  onSelectCategory,
  onAddChild,
  onDeleteChild,
  onAddCategory,
  onDeleteCategory,
}: FamilyPaneProps) {
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [deleteChildTarget, setDeleteChildTarget] = useState<Child | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] =
    useState<Category | null>(null);

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
          {/* 子どもセレクタ */}
          <SidebarGroup className="px-1">
            <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
              子ども
            </SidebarGroupLabel>
            <SidebarGroupAction
              title="子どもを追加"
              onClick={() => setAddChildOpen(true)}
              className="w-6 rounded-[min(var(--radius-md),10px)] text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-3"
            >
              <Plus />
              <span className="sr-only">子どもを追加</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* すべて */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={selectedChildId === null}
                    onClick={() => onSelectChild(null)}
                  >
                    <span>👨‍👩‍👦</span>
                    <span className="truncate">{ALL_CHILDREN_LABEL}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {children.map((child) => (
                  <SidebarMenuItem key={child.id}>
                    <SidebarMenuButton
                      isActive={selectedChildId === child.id}
                      onClick={() => onSelectChild(child.id)}
                    >
                      <span>{child.emoji}</span>
                      <span className="truncate">{child.name}</span>
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
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleteChildTarget(child)}
                          >
                            <Trash2 />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
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
                {/* すべて */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={selectedCategoryId === null}
                    onClick={() => onSelectCategory(null)}
                  >
                    <span>📋</span>
                    <span className="truncate">{ALL_CATEGORIES_LABEL}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {categories.map((cat) => (
                  <SidebarMenuItem key={cat.id}>
                    <SidebarMenuButton
                      isActive={selectedCategoryId === cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                    >
                      <span>{cat.emoji}</span>
                      <span className="truncate">{cat.label}</span>
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
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleteCategoryTarget(cat)}
                          >
                            <Trash2 />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* 子ども追加ダイアログ */}
      <AddItemDialog
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        title="子どもを追加"
        description="新しいお子さんの名前と絵文字を入力してください"
        fieldLabel="名前（例: 三男）"
        fieldId="child-name"
        placeholder="例: 三男"
        onAdd={(name) => onAddChild(name, "👶")}
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

      {/* 子ども削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={deleteChildTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteChildTarget(null);
        }}
        title="子どもを削除しますか？"
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
        onOpenChange={(open) => {
          if (!open) setDeleteCategoryTarget(null);
        }}
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
