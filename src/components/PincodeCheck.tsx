import { useState } from "react";
import { CheckCircle2, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Result =
  | { ok: true; city: string | null; eta: number; cod: boolean }
  | { ok: false }
  | null;

export function PincodeCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) return;
    setLoading(true);
    const { data } = await supabase
      .from("serviceable_pincodes")
      .select("city, eta_days, cod_available, is_active")
      .eq("pincode", pin)
      .maybeSingle();
    setLoading(false);
    setResult(
      data && data.is_active
        ? { ok: true, city: data.city, eta: data.eta_days, cod: data.cod_available }
        : { ok: false },
    );
  }

  return (
    <div className="border border-border p-4">
      <p className="eyebrow flex items-center gap-2">
        <Truck className="size-4 text-gold" /> Check Delivery Availability
      </p>
      <form onSubmit={check} className="mt-3 flex gap-2">
        <Input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="Enter 6-digit PIN code"
          className="h-10 rounded-none"
        />
        <Button type="submit" disabled={loading || pin.length !== 6} className="h-10 rounded-none px-5 text-xs uppercase tracking-[0.16em]">
          {loading ? "Checking…" : "Check"}
        </Button>
      </form>
      {result?.ok && (
        <p className="mt-3 flex animate-fade-in items-center gap-2 text-sm text-success">
          <CheckCircle2 className="size-4" />
          Delivery Available{result.city ? ` in ${result.city}` : ""} · approx {result.eta} days
          {result.cod ? " · COD available" : " · Prepaid only"}
        </p>
      )}
      {result && !result.ok && (
        <p className="mt-3 flex animate-fade-in items-center gap-2 text-sm text-destructive">
          <XCircle className="size-4" /> Delivery Currently Unavailable at this PIN code.
        </p>
      )}
    </div>
  );
}
