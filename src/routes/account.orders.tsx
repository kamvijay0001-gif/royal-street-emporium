import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, inr, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/account/orders")({
  component: MyOrders,
});

function MyOrders() {
  const { user } = useSession();
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders-all", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, status, payment_status, payment_method, placed_at, order_items(product_name, quantity)")
        .order("placed_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <h2 className="font-display text-2xl">My Orders</h2>
      <div className="mt-5 space-y-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="border border-dashed border-border py-20 text-center">
            <p className="font-display text-xl">No orders yet</p>
            <Button asChild className="mt-5 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
              <Link to="/new-arrivals">Start shopping</Link>
            </Button>
          </div>
        )}
        {(data ?? []).map((o) => (
          <Link
            key={o.id}
            to="/order/$id"
            params={{ id: o.id }}
            className="block animate-fade-in border border-border p-5 transition-colors hover:border-primary"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{o.order_number}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(o.placed_at)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {(o.order_items ?? []).map((i) => `${i.product_name} × ${i.quantity}`).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl">{inr(o.total)}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {statusLabel(o.status)} · {o.payment_method === "cod" ? "COD" : "Online"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
