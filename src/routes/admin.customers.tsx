import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, inr } from "@/lib/format";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [profiles, orders] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, phone, created_at"),
        supabase.from("orders").select("user_id, total, placed_at, status"),
      ]);
      return (profiles.data ?? []).map((p) => {
        const mine = (orders.data ?? []).filter((o) => o.user_id === p.id);
        return {
          ...p,
          orders: mine.length,
          spend: mine.filter((o) => o.status !== "cancelled").reduce((a, o) => a + Number(o.total), 0),
          last: mine.sort((a, b) => +new Date(b.placed_at) - +new Date(a.placed_at))[0]?.placed_at ?? null,
        };
      });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Customers</h1>
      {isLoading && <Skeleton className="h-64 w-full" />}
      {!isLoading && (
        <div className="overflow-x-auto border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="p-3 text-left font-normal">Name</th>
                <th className="p-3 text-left font-normal">Contact</th>
                <th className="p-3 text-left font-normal">Orders</th>
                <th className="p-3 text-left font-normal">Total spend</th>
                <th className="p-3 text-left font-normal">Last order</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="p-3">{c.full_name ?? "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {c.email ?? "—"}
                    <span className="block">{c.phone ?? ""}</span>
                  </td>
                  <td className="p-3">{c.orders}</td>
                  <td className="p-3">{inr(c.spend)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{c.last ? formatDate(c.last) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
