import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/delivery")({
  component: AdminDelivery,
});

function AdminDelivery() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ pincode: "", city: "", state: "", eta_days: "5" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pincodes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("serviceable_pincodes").select("*").order("pincode");
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-pincodes"] });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("serviceable_pincodes").insert({
        pincode: form.pincode,
        city: form.city || null,
        state: form.state || null,
        eta_days: Number(form.eta_days || 5),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ pincode: "", city: "", state: "", eta_days: "5" });
      refresh();
      toast.success("PIN code added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, any> }) => {
      const { error } = await supabase.from("serviceable_pincodes").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("serviceable_pincodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Delivery Areas</h1>

      <div className="flex flex-wrap items-end gap-3 border border-border bg-background p-5">
        <Field label="PIN code" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v.replace(/\D/g, "").slice(0, 6) })} />
        <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        <Field label="ETA days" value={form.eta_days} onChange={(v) => setForm({ ...form, eta_days: v })} />
        <Button onClick={() => add.mutate()} disabled={form.pincode.length !== 6} className="h-10 rounded-none text-xs uppercase tracking-[0.16em]">
          Add
        </Button>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}
      {!isLoading && (
        <div className="overflow-x-auto border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="p-3 text-left font-normal">PIN</th>
                <th className="p-3 text-left font-normal">City</th>
                <th className="p-3 text-left font-normal">ETA</th>
                <th className="p-3 text-left font-normal">COD</th>
                <th className="p-3 text-left font-normal">Active</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-3">{p.pincode}</td>
                  <td className="p-3 text-xs text-muted-foreground">{p.city} {p.state}</td>
                  <td className="p-3">{p.eta_days} days</td>
                  <td className="p-3">
                    <Switch checked={p.cod_available} onCheckedChange={(v) => update.mutate({ id: p.id, patch: { cod_available: v } })} />
                  </td>
                  <td className="p-3">
                    <Switch checked={p.is_active} onCheckedChange={(v) => update.mutate({ id: p.id, patch: { is_active: v } })} />
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => remove.mutate(p.id)} aria-label="Remove PIN code">
                      <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-[0.14em]">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 w-40 rounded-none" />
    </div>
  );
}
