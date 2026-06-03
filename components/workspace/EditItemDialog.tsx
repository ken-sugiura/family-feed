"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type EditItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialLabel: string;
  initialEmoji: string;
  onSave: (label: string, emoji: string) => void;
};

export function EditItemDialog({
  open,
  onOpenChange,
  title,
  description,
  initialLabel,
  initialEmoji,
  onSave,
}: EditItemDialogProps) {
  const [label, setLabel] = useState(initialLabel);
  const [emoji, setEmoji] = useState(initialEmoji);

  // ダイアログが開くたびに初期値をリセット
  useEffect(() => {
    if (open) {
      setLabel(initialLabel);
      setEmoji(initialEmoji);
    }
  }, [open, initialLabel, initialEmoji]);

  const handleSubmit = () => {
    const trimmedLabel = label.trim();
    const trimmedEmoji = emoji.trim();
    if (!trimmedLabel) return;
    onSave(trimmedLabel, trimmedEmoji || initialEmoji);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-emoji">絵文字</FieldLabel>
            <Input
              id="edit-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="例: 🎂"
              className="w-20"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-label">名前</FieldLabel>
            <Input
              id="edit-label"
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="例: 旅行"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">キャンセル</Button>} />
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
