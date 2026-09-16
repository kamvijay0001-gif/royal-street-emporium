import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
});

function AdminInventory() {
  const qc = useQueryClient();
  const { user } = useSession();
  const [delta, setDelta] = useState<Record<string, string>>({});
  const [reason, setReason] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("id, sku, size, color, stock, reserved, products(name, sku)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const adjust = useMutation({
    mutationFn: async ({ id, current }: { id: string; current: number }) => {
      const change = Number(delta[id] ?? 0);
      if (!change) throw new Error("Enter a positive or negative quantity");
      const next = current + change;
      if (next < 0) throw new Error("Stock cannot go below zero");
      const { error } = await supabase.from("product_variants").update({ stock: next }).eq("id", id);
      if (error) throw error;
      await supabase.from("inventory_transactions").insert({
        variant_id: id,
        delta: change,
        reason: reason[id] || "manual adjustment",
        admin_id: user?.id ?? null,
      });
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id ?? null,
        action: "stock_adjusted",
        entity: "product_variants",
        entity_id: id,
        old_value: { stock: current },
        new_value: { stock: next, reason: reason[id] ?? "" },
      });
    },
    onSuccess: () => {
      setDelta({});
      setReason({});
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Inventory</h1>
      {isLoading && <Skeleton className="h-64 w-full" />}
      {!isLoading && (
        <div className="overflow-x-auto border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="p-3 text-left font-normal">Product</th>
                <th className="p-3 text-left font-normal">Variant</th>
                <th className="p-3 text-left font-normal">Stock</th>
                <th className="p-3 text-left font-normal">Reserved</th>
                <th className="p-3 text-left font-normal">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    {v.products?.name}
                    <span className="block text-xs text-muted-foreground">{v.sku ?? v.products?.sku ?? "—"}</span>
                  </td>
                  <td className="p-3">{v.color} / {v.size}</td>
                  <td className={`p-3 ${v.stock <= 3 ? "text-destructive" : ""}`}>{v.stock}</td>
                  <td className="p-3">{v.reserved}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Input
                        value={delta[v.id] ?? ""}
                        onChange={(e) => setDelta({ ...delta, [v.id]: e.target.value })}
                        placeholder="+10 / -2"
                        className="h-9 w-24 rounded-none"
                      />
                      <Input
                        value={reason[v.id] ?? ""}
                        onChange={(e) => setReason({ ...reason, [v.id]: e.target.value })}
                        placeholder="reason"
                        className="h-9 w-40 rounded-none"
                      />
                      <Button size="sm" className="h-9 rounded-none text-xs" onClick={() => adjust.mutate({ id: v.id, current: v.stock })}>
                        Apply
                      </Button>
                    </div>
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
