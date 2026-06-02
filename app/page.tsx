import { Workspace } from "@/components/workspace/Workspace";
import childrenData from "@/data/children.json";
import categoriesData from "@/data/categories.json";
import eventsData from "@/data/events.json";
import workspaceData from "@/data/workspace.json";
import {
  childrenSchema,
  categoriesSchema,
  eventsSchema,
  workspaceSchema,
} from "@/lib/schema";

export default function Page() {
  const childrenResult = childrenSchema.safeParse(childrenData);
  const categoriesResult = categoriesSchema.safeParse(categoriesData);
  const eventsResult = eventsSchema.safeParse(eventsData);
  const wsResult = workspaceSchema.safeParse(workspaceData);

  if (
    !childrenResult.success ||
    !categoriesResult.success ||
    !eventsResult.success ||
    !wsResult.success
  ) {
    const errors = [
      !childrenResult.success &&
        `children.json: ${childrenResult.error.issues[0]?.message}`,
      !categoriesResult.success &&
        `categories.json: ${categoriesResult.error.issues[0]?.message}`,
      !eventsResult.success &&
        `events.json: ${eventsResult.error.issues[0]?.message}`,
      !wsResult.success &&
        `workspace.json: ${wsResult.error.issues[0]?.message}`,
    ].filter(Boolean);
    throw new Error(`データの形式が正しくありません:\n${errors.join("\n")}`);
  }

  return (
    <Workspace
      initialChildren={childrenResult.data}
      initialCategories={categoriesResult.data}
      initialEvents={eventsResult.data}
      workspace={wsResult.data}
    />
  );
}
