import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABELS, formatDate, inr, statusLabel } from "@/lib/format";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUS_OPTIONS = [
  "pending_payment",
  "payment_failed",
  "paid",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const PAYMENT_OPTIONS = ["pending", "cod_pending", "paid", "failed", "needs_review", "refunded"];

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  placed_at: string;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  internal_notes: string | null;
  shipping_address: unknown;
  order_items: { id: string; product_name: string; size: string | null; color: string | null; quantity: number; line_total: number }[];
  payments: { expected_amount: number; paid_amount: number | null; status: string; needs_review: boolean; provider_payment_id: string | null; method: string | null; created_at: string }[];
};

function AdminOrders() {
  const qc = useQueryClient();
  const { user } = useSession();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<OrderRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(id, product_name, size, color, quantity, line_total), payments(expected_amount, paid_amount, status, needs_review, provider_payment_id, method, created_at)")
        .order("placed_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch, note }: { id: string; patch: Record<string, unknown>; note?: string }) => {
      const before = (data ?? []).find((o) => o.id === id);
      const { error } = await supabase.from("orders").update(patch).eq("id", id);
      if (error) throw error;
      if (patch["status"]) {
        await supabase.from("order_status_history").insert({ order_id: id, status: String(patch["status"]), note: note ?? null });
      }
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id ?? null,
        action: "order_updated",
        entity: "orders",
        entity_id: id,
        old_value: before ? { status: before.status, payment_status: before.payment_status } : null,
        new_value: patch,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data ?? []).filter((o) => {
    const matchesSearch =
      !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchesFilter =
      filter === "all" ||
      (filter === "review" ? o.payment_status === "needs_review" : o.status === filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Orders</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order number, customer or phone"
          className="h-10 max-w-sm rounded-none"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-10 w-56 rounded-none"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All orders</SelectItem>
            <SelectItem value="review">Payment needs review</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {!isLoading && (
        <div className="overflow-x-auto border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="p-3 text-left font-normal">Order</th>
                <th className="p-3 text-left font-normal">Customer</th>
                <th className="p-3 text-left font-normal">Amount</th>
                <th className="p-3 text-left font-normal">Payment</th>
                <th className="p-3 text-left font-normal">Status</th>
                <th className="p-3 text-left font-normal">Date</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found.</td></tr>
              )}
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{o.order_number}</td>
                  <td className="p-3">
                    {o.customer_name}
                    <span className="block text-xs text-muted-foreground">{o.customer_phone}</span>
                  </td>
                  <td className="p-3">{inr(o.total)}</td>
                  <td className="p-3">
                    <span className={o.payment_status === "needs_review" ? "text-destructive" : ""}>
                      {statusLabel(o.payment_status)}
                    </span>
                    <span className="block text-xs text-muted-foreground">{o.payment_method === "cod" ? "COD" : "Online"}</span>
                  </td>
                  <td className="p-3">{statusLabel(o.status)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDate(o.placed_at)}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" className="rounded-none text-xs" onClick={() => setOpen(o)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderDialog order={open} onClose={() => setOpen(null)} onUpdate={(patch, note) => open && update.mutate({ id: open.id, patch, ...(note ? { note } : {}) })} />
    </div>
  );
}

function OrderDialog({
  order,
  onClose,
  onUpdate,
}: {
  order: OrderRow | null;
  onClose: () => void;
  onUpdate: (patch: Record<string, unknown>, note?: string) => void;
}) {
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [notes, setNotes] = useState("");

  if (!order) return null;
  const address = order.shipping_address as Record<string, string>;
  const payment = order.payments?.[0];
  const mismatch = payment && payment.paid_amount != null && Number(payment.paid_amount) !== Number(payment.expected_amount);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{order.order_number}</DialogTitle>
        </DialogHeader>

        {(mismatch || order.payment_status === "needs_review") && (
          <div className="border border-destructive bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Payment requires admin review</p>
            <p className="mt-1 text-xs">
              Expected {inr(payment?.expected_amount ?? order.total)} · Reported {inr(payment?.paid_amount ?? 0)} ·{" "}
              {payment?.provider_payment_id ?? "no payment reference"} · {payment?.method ?? "unknown method"}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="eyebrow text-muted-foreground">Customer</p>
            <p className="mt-1">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
          </div>
          <div>
            <p className="eyebrow text-muted-foreground">Deliver to</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {address?.["house"]} {address?.["street"]}, {address?.["city"]}, {address?.["state"]} — {address?.["pincode"]}
            </p>
          </div>
        </div>

        <div className="border border-border">
          {order.order_items?.map((i) => (
            <div key={i.id} className="flex items-center justify-between border-b border-border p-3 text-sm last:border-0">
              <span>
                {i.product_name}
                <span className="block text-xs text-muted-foreground">{i.color} / {i.size} · Qty {i.quantity}</span>
              </span>
              <span>{inr(i.line_total)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-secondary/60 p-3 font-medium">
            <span>Total</span>
            <span>{inr(order.total)}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs uppercase tracking-[0.14em]">Order status</Label>
            <Select value={order.status} onValueChange={(v) => onUpdate({ status: v })}>
              <SelectTrigger className="mt-1 h-10 rounded-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em]">Payment status</Label>
            <Select value={order.payment_status} onValueChange={(v) => onUpdate({ payment_status: v })}>
              <SelectTrigger className="mt-1 h-10 rounded-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs uppercase tracking-[0.14em]">Courier</Label>
            <Input value={courier || order.courier_name || ""} onChange={(e) => setCourier(e.target.value)} className="mt-1 h-10 rounded-none" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em]">Tracking no.</Label>
            <Input value={tracking || order.tracking_number || ""} onChange={(e) => setTracking(e.target.value)} className="mt-1 h-10 rounded-none" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em]">Tracking URL</Label>
            <Input value={trackingUrl || order.tracking_url || ""} onChange={(e) => setTrackingUrl(e.target.value)} className="mt-1 h-10 rounded-none" />
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-[0.14em]">Internal notes</Label>
          <Textarea
            value={notes || order.internal_notes || ""}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 rounded-none"
          />
        </div>

        <Button
          className="rounded-none text-xs uppercase tracking-[0.16em]"
          onClick={() =>
            onUpdate({
              courier_name: courier || order.courier_name,
              tracking_number: tracking || order.tracking_number,
              tracking_url: trackingUrl || order.tracking_url,
              internal_notes: notes || order.internal_notes,
            })
          }
        >
          Save shipping details
        </Button>
      </DialogContent>
    </Dialog>
  );
}
