import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/returns")({
  validateSearch: z.object({ order: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Returns & Exchanges — Royal Street Mini Mall" },
      { name: "description", content: "Request a return or exchange within 7 days of delivery and track the status of your request." },
      { property: "og:title", content: "Returns & Exchanges — Royal Street Mini Mall" },
      { property: "og:description", content: "Request a return or exchange and track its status." },
    ],
  }),
  component: ReturnsPage,
});

const REASONS = [
  { v: "wrong_size", l: "Wrong size" },
  { v: "damaged", l: "Damaged product" },
  { v: "wrong_product", l: "Wrong product delivered" },
  { v: "not_as_expected", l: "Not as expected" },
  { v: "other", l: "Other" },
];

function ReturnsPage() {
  const { order: orderParam } = Route.useSearch();
  const { user } = useSession();
  const qc = useQueryClient();

  const [orderId, setOrderId] = useState("");
  const [itemId, setItemId] = useState("");
  const [type, setType] = useState("return");
  const [reason, setReason] = useState("wrong_size");
  const [resolution, setResolution] = useState("refund");
  const [description, setDescription] = useState("");

  const orders = useQuery({
    queryKey: ["returnable-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, placed_at, order_items(id, product_name, size, color, quantity)")
        .in("status", ["delivered", "out_for_delivery"])
        .order("placed_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      if (orderParam && !orderId) {
        const match = rows.find((o) => o.order_number === orderParam);
        if (match) setOrderId(match.id);
      }
      return rows;
    },
  });

  const myReturns = useQuery({
    queryKey: ["my-returns", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("returns")
        .select("id, type, reason, status, created_at, admin_note, orders(order_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const selectedOrder = (orders.data ?? []).find((o) => o.id === orderId);
      const item = selectedOrder?.order_items?.find((i) => i.id === itemId);
      const { error } = await supabase.from("returns").insert({
        order_id: orderId,
        order_item_id: itemId || null,
        user_id: user!.id,
        type,
        quantity: item?.quantity ?? 1,
        reason,
        description,
        preferred_resolution: resolution,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDescription("");
      qc.invalidateQueries({ queryKey: ["my-returns"] });
      toast.success("Request submitted. Our team will review it shortly.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectedOrder = (orders.data ?? []).find((o) => o.id === orderId);

  if (!user) {
    return (
      <StoreLayout>
        <PageHeader title="Returns & Exchanges" />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Sign in to raise a return or exchange request.</p>
          <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <PageHeader title="Returns & Exchanges" subtitle="Within 7 days of delivery, with tags intact" />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
        <section className="animate-fade-up space-y-4">
          <h2 className="font-display text-2xl">Raise a request</h2>

          {orders.isLoading && <Skeleton className="h-40 w-full" />}
          {!orders.isLoading && (orders.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              You don't have a delivered order eligible for return right now.
            </p>
          )}

          {(orders.data ?? []).length > 0 && (
            <>
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Order</Label>
                <Select value={orderId} onValueChange={(v) => { setOrderId(v); setItemId(""); }}>
                  <SelectTrigger className="mt-1 h-11 rounded-none"><SelectValue placeholder="Select an order" /></SelectTrigger>
                  <SelectContent>
                    {(orders.data ?? []).map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.order_number} · {formatDate(o.placed_at)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOrder && (
                <div>
                  <Label className="text-xs uppercase tracking-[0.14em]">Product</Label>
                  <Select value={itemId} onValueChange={setItemId}>
                    <SelectTrigger className="mt-1 h-11 rounded-none"><SelectValue placeholder="Select a product" /></SelectTrigger>
                    <SelectContent>
                      {(selectedOrder.order_items ?? []).map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.product_name} · {i.color} / {i.size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-[0.14em]">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="mt-1 h-11 rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="return">Return</SelectItem>
                      <SelectItem value="exchange">Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.14em]">Preferred resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="mt-1 h-11 rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                      <SelectItem value="size_change">Different size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="mt-1 h-11 rounded-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => (
                      <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Tell us more</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 rounded-none" />
              </div>

              <Button
                onClick={() => submit.mutate()}
                disabled={!orderId || !itemId || submit.isPending}
                className="rounded-none px-8 text-xs uppercase tracking-[0.16em]"
              >
                Submit request
              </Button>
            </>
          )}
        </section>

        <section className="animate-fade-up">
          <h2 className="font-display text-2xl">Your requests</h2>
          <div className="mt-4 space-y-3">
            {(myReturns.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No return or exchange requests yet.</p>
            )}
            {(myReturns.data ?? []).map((r) => (
              <div key={r.id} className="border border-border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize">{r.type}</p>
                  <span className="text-[0.65rem] uppercase tracking-[0.14em] text-gold">{statusLabel(r.status)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Order {r.orders?.order_number} · {formatDate(r.created_at)}
                </p>
                {r.admin_note && <p className="mt-2 text-xs">{r.admin_note}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
