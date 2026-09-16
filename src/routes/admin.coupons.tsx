import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
});

function AdminCoupons() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    code: "", description: "", discount_type: "percent", discount_value: "",
    min_order: "0", max_discount: "", usage_limit: "", per_customer_limit: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("coupons").insert({
        code: form.code.toUpperCase(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value || 0),
        min_order: Number(form.min_order || 0),
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        per_customer_limit: form.per_customer_limit ? Number(form.per_customer_limit) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ code: "", description: "", discount_type: "percent", discount_value: "", min_order: "0", max_discount: "", usage_limit: "", per_customer_limit: "" });
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("coupons").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Coupons</h1>

      <div className="grid gap-4 border border-border bg-background p-5 sm:grid-cols-4">
        <F label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} />
        <div>
          <Label className="text-xs uppercase tracking-[0.14em]">Type</Label>
          <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
            <SelectTrigger className="mt-1 h-10 rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <F label="Value" value={form.discount_value} onChange={(v) => setForm({ ...form, discount_value: v })} />
        <F label="Min order" value={form.min_order} onChange={(v) => setForm({ ...form, min_order: v })} />
        <F label="Max discount" value={form.max_discount} onChange={(v) => setForm({ ...form, max_discount: v })} />
        <F label="Total usage limit" value={form.usage_limit} onChange={(v) => setForm({ ...form, usage_limit: v })} />
        <F label="Per customer limit" value={form.per_customer_limit} onChange={(v) => setForm({ ...form, per_customer_limit: v })} />
        <F label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        <div className="sm:col-span-4">
          <Button onClick={() => create.mutate()} disabled={!form.code || !form.discount_value} className="rounded-none text-xs uppercase tracking-[0.16em]">
            Create coupon
          </Button>
        </div>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((c) => (
          <div key={c.id} className="border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl">{c.code}</p>
              <Switch checked={c.is_active} onCheckedChange={(v) => toggle.mutate({ id: c.id, is_active: v })} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {c.discount_type === "percent" ? `${c.discount_value}% off` : `${inr(c.discount_value)} off`} · min {inr(c.min_order)}
              {c.max_discount ? ` · max ${inr(c.max_discount)}` : ""} · used {c.used_count} times
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-[0.14em]">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 rounded-none" />
    </div>
  );
}
