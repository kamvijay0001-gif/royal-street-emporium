import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const PAID = ["paid", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [orders, products, variants, customers, returns] = await Promise.all([
        supabase.from("orders").select("id, total, status, payment_status, payment_method, placed_at, order_items(product_name, quantity, line_total)"),
        supabase.from("products").select("id, is_active"),
        supabase.from("product_variants").select("id, stock, product_id"),
        supabase.from("profiles").select("id, created_at"),
        supabase.from("returns").select("id, status"),
      ]);
      return {
        orders: orders.data ?? [],
        products: products.data ?? [],
        variants: variants.data ?? [],
        customers: customers.data ?? [],
        returns: returns.data ?? [],
      };
    },
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  const now = Date.now();
  const since = (days: number) => now - days * 86400000;
  const revenueOf = (rows: typeof data.orders) =>
    rows.filter((o) => PAID.includes(o.status)).reduce((a, o) => a + Number(o.total), 0);

  const today = data.orders.filter((o) => new Date(o.placed_at).getTime() >= since(1));
  const week = data.orders.filter((o) => new Date(o.placed_at).getTime() >= since(7));
  const month = data.orders.filter((o) => new Date(o.placed_at).getTime() >= since(30));

  const lowStock = data.variants.filter((v) => v.stock <= 3).length;
  const pending = data.orders.filter((o) => ["pending_payment", "paid", "confirmed", "processing", "packed"].includes(o.status)).length;
  const delivered = data.orders.filter((o) => o.status === "delivered").length;
  const cancelled = data.orders.filter((o) => o.status === "cancelled").length;
  const cod = data.orders.filter((o) => o.payment_method === "cod").length;
  const online = data.orders.length - cod;
  const failed = data.orders.filter((o) => o.payment_status === "failed" || o.payment_status === "needs_review").length;

  const byDay = Array.from({ length: 14 }).map((_, i) => {
    const day = new Date(now - (13 - i) * 86400000);
    const key = day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const rows = data.orders.filter((o) => new Date(o.placed_at).toDateString() === day.toDateString());
    return { day: key, revenue: revenueOf(rows), orders: rows.length };
  });

  const productSales = new Map<string, number>();
  for (const o of data.orders) {
    for (const i of o.order_items ?? []) {
      productSales.set(i.product_name, (productSales.get(i.product_name) ?? 0) + Number(i.line_total));
    }
  }
  const topProducts = [...productSales.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name: name.slice(0, 18), value }));

  const paySplit = [
    { name: "Online", value: online },
    { name: "COD", value: cod },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total revenue" value={inr(revenueOf(data.orders))} />
        <Stat label="Today" value={inr(revenueOf(today))} sub={`${today.length} orders`} />
        <Stat label="Last 7 days" value={inr(revenueOf(week))} sub={`${week.length} orders`} />
        <Stat label="Last 30 days" value={inr(revenueOf(month))} sub={`${month.length} orders`} />
        <Stat label="Orders" value={String(data.orders.length)} sub={`${pending} in progress`} />
        <Stat label="Delivered / Cancelled" value={`${delivered} / ${cancelled}`} />
        <Stat label="Customers" value={String(data.customers.length)} />
        <Stat label="Products" value={String(data.products.length)} sub={`${lowStock} low stock variants`} />
        <Stat label="COD orders" value={String(cod)} />
        <Stat label="Online orders" value={String(online)} />
        <Stat label="Payments needing review" value={String(failed)} />
        <Stat label="Return requests" value={String(data.returns.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue — last 14 days">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} />
              <Tooltip formatter={(v: number) => inr(v)} />
              <Line type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Orders — last 14 days">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} allowDecimals={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="var(--primary)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Best selling products">
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" fontSize={11} width={110} tickLine={false} />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Bar dataKey="value" fill="var(--gold)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Payment split">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={paySplit} dataKey="value" nameKey="name" outerRadius={90} label>
                {paySplit.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "var(--primary)" : "var(--gold)"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="animate-fade-up border border-border bg-background p-5">
      <p className="eyebrow text-[0.6rem] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-background p-5">
      <p className="eyebrow mb-4">{title}</p>
      {children}
    </div>
  );
}
