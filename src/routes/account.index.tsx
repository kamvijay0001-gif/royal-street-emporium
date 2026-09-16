import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, inr, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/account/")({
  component: AccountDashboard,
});

function AccountDashboard() {
  const { user } = useSession();
  const [form, setForm] = useState({ full_name: "", phone: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const orders = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, status, placed_at")
        .order("placed_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const notifications = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, created_at, is_read")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (profile.data) {
      setForm({
        full_name: profile.data.full_name ?? "",
        phone: profile.data.phone ?? "",
        whatsapp: profile.data.whatsapp ?? "",
      });
    }
  }, [profile.data]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user!.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl">Profile</h2>
        {profile.isLoading ? (
          <Skeleton className="mt-4 h-40 w-full" />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-[0.14em]">Full name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1 h-11 rounded-none" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em]">Email</Label>
              <Input value={user?.email ?? ""} readOnly className="mt-1 h-11 rounded-none bg-secondary" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em]">Mobile</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 h-11 rounded-none" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.14em]">WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="mt-1 h-11 rounded-none" />
            </div>
            <div>
              <Button onClick={save} disabled={saving} className="rounded-none px-8 text-xs uppercase tracking-[0.16em]">
                Save changes
              </Button>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <Link to="/account/orders" className="text-xs uppercase tracking-[0.14em] underline">View all</Link>
        </div>
        <div className="mt-4 space-y-3">
          {orders.isLoading && <Skeleton className="h-20 w-full" />}
          {!orders.isLoading && (orders.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">You haven't placed an order yet.</p>
          )}
          {(orders.data ?? []).map((o) => (
            <Link
              key={o.id}
              to="/order/$id"
              params={{ id: o.id }}
              className="flex items-center justify-between border border-border p-4 text-sm transition-colors hover:border-primary"
            >
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="text-xs text-muted-foreground">{formatDate(o.placed_at)} · {statusLabel(o.status)}</p>
              </div>
              <p className="font-display text-lg">{inr(o.total)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Notifications</h2>
        <div className="mt-4 space-y-3">
          {(notifications.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {(notifications.data ?? []).map((n) => (
            <div key={n.id} className="border border-border p-4">
              <p className="text-sm font-medium">{n.title}</p>
              {n.body && <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.created_at)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
