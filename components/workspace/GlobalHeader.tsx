"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/workspace/ThemeToggle";

type GlobalHeaderProps = {
  workspaceName: string;
  filterLabel: string;
  eventCaption: string;
};

export function GlobalHeader({
  workspaceName,
  filterLabel,
  eventCaption,
}: GlobalHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-5">
      <Breadcrumb
        className="min-w-0 flex-1 overflow-hidden"
        aria-label="パンくず"
      >
        <BreadcrumbList className="flex-nowrap text-[11px]">
          <BreadcrumbItem className="shrink-0">
            <span className="text-muted-foreground">{workspaceName}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="shrink-0">
            <span className="text-muted-foreground">{filterLabel}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate font-medium">
              {eventCaption}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ThemeToggle />
    </header>
  );
}
