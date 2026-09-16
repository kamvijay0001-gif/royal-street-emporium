import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — Royal Street Mini Mall" },
      { name: "description", content: "Sign in to track orders, save your wishlist and check out faster at Royal Street Mini Mall." },
      { property: "og:title", content: "Sign In — Royal Street Mini Mall" },
      { property: "og:description", content: "Sign in to track orders and check out faster." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/account", replace: true });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/account" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in didn't work. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/account" });
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-md animate-fade-up px-4 py-20">
        <p className="eyebrow text-center text-muted-foreground">Royal Street Mini Mall</p>
        <h1 className="mt-3 text-center font-display text-4xl">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>

        {sent ? (
          <p className="mt-8 border border-gold bg-gold-soft/30 p-6 text-center text-sm">
            Check your email to confirm your address, then come back and sign in.
          </p>
        ) : (
          <>
            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <div>
                  <Label className="text-xs uppercase tracking-[0.14em]">Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 h-11 rounded-none" />
                </div>
              )}
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 h-11 rounded-none" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1 h-11 rounded-none" />
              </div>
              <Button type="submit" disabled={busy} className="w-full rounded-none py-6 text-xs uppercase tracking-[0.2em]">
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" onClick={google} className="w-full rounded-none py-6 text-xs uppercase tracking-[0.16em]">
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to Royal Street?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-foreground underline">
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </StoreLayout>
  );
}
