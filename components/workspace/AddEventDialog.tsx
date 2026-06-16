"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

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
import { uploadPhoto } from "@/lib/storage";

type AddEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (caption: string, imageUrl?: string) => void;
};

export function AddEventDialog({
  open,
  onOpenChange,
  onAdd,
}: AddEventDialogProps) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCaption("");
    setFile(null);
    setPreview(null);
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    // input をリセットして同じファイルを再選択できるようにする
    e.target.value = "";
  };

  const removePhoto = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleSubmit = async () => {
    const trimmed = caption.trim();
    if (!trimmed) return;

    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await uploadPhoto(file);
      }
      onAdd(trimmed, imageUrl);
      reset();
      onOpenChange(false);
    } catch {
      alert("写真のアップロードに失敗しました。もう一度お試しください。");
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>イベントを追加</DialogTitle>
          <DialogDescription>
            今日のちょっとした出来事を記録しましょう
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          {/* 写真選択エリア */}
          <div className="flex flex-col gap-2">
            {preview ? (
              <div className="relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="プレビュー"
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground hover:bg-background"
                  aria-label="写真を削除"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground hover:bg-muted/60"
              >
                <ImagePlus className="size-6" />
                <span className="text-xs">写真を選択（任意）</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {preview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                写真を変更
              </Button>
            )}
          </div>

          {/* キャプション */}
          <Field>
            <FieldLabel htmlFor="event-caption">一言キャプション</FieldLabel>
            <Input
              id="event-caption"
              autoFocus
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !uploading) void handleSubmit();
              }}
              placeholder="例: 公園で初めて鉄棒できた！"
              disabled={uploading}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={uploading}>
                キャンセル
              </Button>
            }
          />
          <Button
            onClick={() => void handleSubmit()}
            disabled={!caption.trim() || uploading}
          >
            {uploading ? "投稿中..." : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
