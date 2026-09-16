import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAdmin, useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Royal Street Mini Mall" },
      { name: "description", content: "Store administration for Royal Street Mini Mall." },
      { property: "og:title", content: "Admin — Royal Street Mini Mall" },
      { property: "og:description", content: "Store administration." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/returns", label: "Returns & Refunds" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/delivery", label: "Delivery Areas" },
  { to: "/admin/audit", label: "Audit Log" },
  { to: "/admin/settings", label: "Settings" },
] as const;

function AdminLayout() {
  const { user, loading } = useSession();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin-login", replace: true });
  }, [loading, user, navigate]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin-login", replace: true });
  }

  if (loading || (user && isAdmin === undefined)) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-10">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="font-display text-3xl">Restricted area</h1>
          <p className="mt-3 text-sm text-muted-foreground">This account doesn't have admin access.</p>
          <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
            <Link to="/">Back to store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:block">
        <div className="border-b border-border px-5 py-5">
          <p className="font-display text-lg leading-none">ROYAL STREET</p>
          <p className="eyebrow mt-1 text-[0.55rem] text-muted-foreground">Admin Panel</p>
        </div>
        <nav className="p-3 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: "exact" in l ? l.exact : false }}
              activeProps={{ className: "bg-secondary font-medium" }}
              className="block rounded-sm px-3 py-2 transition-colors hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/" className="block rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary">
            View store
          </Link>
          <Button variant="ghost" onClick={signOut} className="mt-1 w-full justify-start px-3 text-sm">
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 text-xs md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: "exact" in l ? l.exact : false }}
              activeProps={{ className: "bg-secondary font-medium" }}
              className="whitespace-nowrap rounded-sm px-3 py-2"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
