import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, inr, statusLabel } from "@/lib/format";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/admin/returns")({
  component: AdminReturns,
});

function AdminReturns() {
  const qc = useQueryClient();
  const { user } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("returns")
        .select("*, orders(order_number, total, customer_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refunds = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: async () => {
      const { data } = await supabase.from("refunds").select("*, orders(order_number)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("returns").update({ status }).eq("id", id);
      if (error) throw error;
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id ?? null,
        action: "return_updated",
        entity: "returns",
        entity_id: id,
        new_value: { status },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-returns"] });
      toast.success("Return updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startRefund = useMutation({
    mutationFn: async ({ returnId, orderId, amount }: { returnId: string; orderId: string; amount: number }) => {
      const { error } = await supabase.from("refunds").insert({
        order_id: orderId,
        return_id: returnId,
        amount,
        status: "refund_requested",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      refunds.refetch();
      toast.success("Refund started");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setRefundStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("refunds").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => refunds.refetch(),
  });

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-3xl">Return & exchange requests</h1>
        {isLoading && <Skeleton className="mt-4 h-40 w-full" />}
        <div className="mt-4 space-y-3">
          {(data ?? []).length === 0 && !isLoading && <p className="text-sm text-muted-foreground">No requests yet.</p>}
          {(data ?? []).map((r) => (
            <div key={r.id} className="border border-border bg-background p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium capitalize">{r.type} · {r.orders?.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.orders?.customer_name} · {formatDate(r.created_at)} · Reason: {r.reason.replace(/_/g, " ")}
                  </p>
                  {r.description && <p className="mt-2 text-xs">{r.description}</p>}
                </div>
                <span className="text-[0.65rem] uppercase tracking-[0.14em] text-gold">{statusLabel(r.status)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["return_approved", "return_rejected", "returned"].map((s) => (
                  <Button key={s} size="sm" variant="outline" className="rounded-none text-xs" onClick={() => setStatus.mutate({ id: r.id, status: s })}>
                    {statusLabel(s)}
                  </Button>
                ))}
                <Button
                  size="sm"
                  className="rounded-none text-xs"
                  onClick={() => startRefund.mutate({ returnId: r.id, orderId: r.order_id, amount: Number(r.orders?.total ?? 0) })}
                >
                  Start refund
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Refunds</h2>
        <div className="mt-4 space-y-3">
          {(refunds.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No refunds yet.</p>}
          {(refunds.data ?? []).map((f) => (
            <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background p-4 text-sm">
              <div>
                <p className="font-medium">{f.orders?.order_number} · {inr(f.amount)}</p>
                <p className="text-xs text-muted-foreground">{statusLabel(f.status)} · {formatDate(f.created_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["refund_approved", "refund_processing", "refund_completed", "refund_failed"].map((s) => (
                  <Button key={s} size="sm" variant="outline" className="rounded-none text-xs" onClick={() => setRefundStatus.mutate({ id: f.id, status: s })}>
                    {statusLabel(s)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
