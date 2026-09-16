import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { useIsAdmin, useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Royal Street Mini Mall" },
      { name: "description", content: "Manage your profile, orders, addresses and returns at Royal Street Mini Mall." },
      { property: "og:title", content: "My Account — Royal Street Mini Mall" },
      { property: "og:description", content: "Manage your profile, orders and returns." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  const { user, loading } = useSession();
  
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!user) return null;

  return (
    <StoreLayout>
      <PageHeader title="My Account" subtitle={user.email ?? undefined} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[220px_1fr]">
        <nav className="h-fit space-y-1 text-sm md:sticky md:top-28">
          {[
            { to: "/account", label: "Dashboard", exact: true },
            { to: "/account/orders", label: "My Orders" },
            { to: "/account/addresses", label: "Addresses" },
            { to: "/wishlist", label: "Wishlist" },
            { to: "/returns", label: "Returns & Exchange" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact ?? false }}
              activeProps={{ className: "bg-secondary font-medium" }}
              className="block px-3 py-2.5 transition-colors hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <Button variant="ghost" onClick={signOut} className="w-full justify-start px-3 text-sm">
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </StoreLayout>
  );
}
