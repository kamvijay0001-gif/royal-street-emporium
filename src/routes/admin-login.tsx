import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsAdmin, useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Staff Sign In — Royal Street Mini Mall" },
      { name: "description", content: "Private staff sign-in for Royal Street Mini Mall store management." },
      { property: "og:title", content: "Staff Sign In — Royal Street Mini Mall" },
      { property: "og:description", content: "Private staff sign-in." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useSession();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin === true) navigate({ to: "/admin", replace: true });
  }, [user, isAdmin, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data, error: roleError } = await supabase.rpc("is_admin");
      if (roleError || data !== true) {
        await supabase.auth.signOut();
        toast.error("This account is not authorised for store management.");
        return;
      }
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm animate-fade-up border border-border bg-background p-8">
        <p className="font-display text-xl leading-none">ROYAL STREET</p>
        <p className="eyebrow mt-1 text-[0.55rem] text-muted-foreground">Store Management</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-[0.14em]">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 h-11 rounded-none" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em]">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 h-11 rounded-none" />
          </div>
          <Button type="submit" disabled={busy} className="w-full rounded-none py-6 text-xs uppercase tracking-[0.2em]">
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Authorised staff only. Customer accounts cannot sign in here.
        </p>
      </div>
    </div>
  );
}
