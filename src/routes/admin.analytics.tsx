import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

const RANGES = [
  { label: "Today", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "3 months", days: 90 },
  { label: "1 year", days: 365 },
];

const PAID = ["paid", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

function AdminAnalytics() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [orders, returns, carts] = await Promise.all([
        supabase.from("orders").select("id, user_id, total, status, payment_method, payment_status, placed_at"),
        supabase.from("returns").select("id, created_at"),
        supabase.from("carts").select("id, user_id, updated_at, status, cart_items(id)"),
      ]);
      return { orders: orders.data ?? [], returns: returns.data ?? [], carts: carts.data ?? [] };
    },
  });

  if (isLoading || !data) return <Skeleton className="h-64 w-full" />;

  const since = Date.now() - days * 86400000;
  const inRange = data.orders.filter((o) => new Date(o.placed_at).getTime() >= since);
  const paid = inRange.filter((o) => PAID.includes(o.status));
  const revenue = paid.reduce((a, o) => a + Number(o.total), 0);
  const cancelled = inRange.filter((o) => o.status === "cancelled").length;
  const aov = paid.length ? revenue / paid.length : 0;
  const cod = inRange.filter((o) => o.payment_method === "cod").length;
  const failed = inRange.filter((o) => o.payment_status === "failed").length;
  const buyers = new Set(paid.map((o) => o.user_id));
  const repeat = [...buyers].filter((u) => paid.filter((o) => o.user_id === u).length > 1).length;
  const returnsInRange = data.returns.filter((r) => new Date(r.created_at).getTime() >= since).length;
  const abandoned = data.carts.filter((c) => c.status === "active" && (c.cart_items ?? []).length > 0).length;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Analytics</h1>
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Button
            key={r.label}
            size="sm"
            variant={days === r.days ? "default" : "outline"}
            className="rounded-none text-xs uppercase tracking-[0.14em]"
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={inr(revenue)} />
        <Stat label="Orders" value={String(inRange.length)} />
        <Stat label="Average order value" value={inr(Math.round(aov))} />
        <Stat label="Cancelled" value={String(cancelled)} />
        <Stat label="COD share" value={inRange.length ? `${Math.round((cod / inRange.length) * 100)}%` : "0%"} />
        <Stat label="Online share" value={inRange.length ? `${Math.round(((inRange.length - cod) / inRange.length) * 100)}%` : "0%"} />
        <Stat label="Failed payments" value={String(failed)} />
        <Stat label="Repeat customers" value={String(repeat)} />
        <Stat label="Return requests" value={String(returnsInRange)} />
        <Stat label="Return rate" value={paid.length ? `${Math.round((returnsInRange / paid.length) * 100)}%` : "0%"} />
        <Stat label="Abandoned carts" value={String(abandoned)} />
        <Stat label="Customers who bought" value={String(buyers.size)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background p-5">
      <p className="eyebrow text-[0.6rem] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
