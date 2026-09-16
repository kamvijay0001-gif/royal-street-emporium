import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useStore";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function AdminCategories() {
  const qc = useQueryClient();
  const { data } = useCategories();
  const [name, setName] = useState("");
  const [parent, setParent] = useState("none");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("categories").insert({
        name,
        slug: slugify(name),
        parent_id: parent === "none" ? null : parent,
        position: (data ?? []).length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      refresh();
      toast.success("Category added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("categories").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const parents = (data ?? []).filter((c) => !c.parent_id);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Categories</h1>

      <div className="flex flex-wrap items-end gap-3 border border-border bg-background p-5">
        <div>
          <Label className="text-xs uppercase tracking-[0.14em]">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-10 w-56 rounded-none" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em]">Parent</Label>
          <Select value={parent} onValueChange={setParent}>
            <SelectTrigger className="mt-1 h-10 w-56 rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Top level</SelectItem>
              {parents.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => create.mutate()} disabled={!name} className="h-10 rounded-none text-xs uppercase tracking-[0.16em]">
          Add category
        </Button>
      </div>

      <div className="space-y-6">
        {parents.map((p) => (
          <div key={p.id} className="border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl">{p.name}</p>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2">
                  Visible
                  <Switch checked={p.is_active} onCheckedChange={(v) => update.mutate({ id: p.id, patch: { is_active: v } })} />
                </label>
                <Input
                  defaultValue={p.position}
                  onBlur={(e) => update.mutate({ id: p.id, patch: { position: Number(e.target.value) } })}
                  className="h-8 w-16 rounded-none"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(data ?? []).filter((c) => c.parent_id === p.id).map((c) => (
                <div key={c.id} className="flex items-center justify-between border border-border px-3 py-2 text-sm">
                  <span>{c.name}</span>
                  <Switch checked={c.is_active} onCheckedChange={(v) => update.mutate({ id: c.id, patch: { is_active: v } })} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
