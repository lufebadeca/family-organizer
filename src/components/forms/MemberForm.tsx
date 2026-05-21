import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEMBER_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";
import {
  useCreateMember,
  useUpdateMember,
  type Member,
} from "@/lib/queries/members";

interface Props {
  initial?: Member;
  onDone?: () => void;
}

export function MemberForm({ initial, onDone }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? MEMBER_COLORS[0]!);
  const [emoji, setEmoji] = useState(initial?.emoji ?? "");
  const create = useCreateMember();
  const update = useUpdateMember();
  const submitting = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      color,
      emoji: emoji.trim() || null,
    };
    if (!payload.name) return;
    if (initial) {
      await update.mutateAsync({ id: initial.id, patch: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="m-name">Nombre</Label>
        <Input
          id="m-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="María, Juan..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="m-emoji">Emoji (opcional, sustituye inicial)</Label>
        <Input
          id="m-emoji"
          maxLength={4}
          value={emoji ?? ""}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="😺"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {MEMBER_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-transform",
                color === c ? "scale-110 border-foreground" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting || !name.trim()}>
        {initial ? "Guardar cambios" : "Agregar miembro"}
      </Button>
    </form>
  );
}
