import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useStore";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const GROUPS: { key: string; title: string; fields: { name: string; label: string; area?: boolean }[] }[] = [
  {
    key: "store",
    title: "Store details",
    fields: [
      { name: "name", label: "Store name" },
      { name: "tagline", label: "Tagline" },
      { name: "phone", label: "Phone" },
      { name: "whatsapp", label: "WhatsApp number" },
      { name: "email", label: "Email" },
      { name: "instagram", label: "Instagram URL" },
      { name: "address", label: "Address", area: true },
      { name: "hours", label: "Opening hours" },
    ],
  },
  {
    key: "payments",
    title: "Payments",
    fields: [
      { name: "upi_id", label: "UPI ID" },
      { name: "upi_name", label: "UPI display name" },
      { name: "cod_fee", label: "COD security fee (₹)" },
      { name: "gateway", label: "Payment gateway" },
      { name: "gateway_enabled", label: "Gateway enabled (true/false)" },
    ],
  },
  {
    key: "delivery",
    title: "Delivery",
    fields: [
      { name: "delivery_fee", label: "Delivery fee (₹)" },
      { name: "free_delivery_threshold", label: "Free delivery above (₹)" },
      { name: "default_eta_days", label: "Default ETA (days)" },
    ],
  },
  {
    key: "policies",
    title: "Policies",
    fields: [
      { name: "shipping", label: "Shipping policy", area: true },
      { name: "returns", label: "Return & exchange policy", area: true },
      { name: "cancellation", label: "Cancellation policy", area: true },
      { name: "refunds", label: "Refund policy", area: true },
      { name: "privacy", label: "Privacy policy", area: true },
      { name: "terms", label: "Terms & conditions", area: true },
    ],
  },
];

function AdminSettings() {
  const { data, isLoading } = useSettings();
  const qc = useQueryClient();
  const { user } = useSession();
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, Record<string, string>> = {};
    for (const g of GROUPS) {
      next[g.key] = {};
      for (const f of g.fields) next[g.key]![f.name] = String((data[g.key] ?? {})[f.name] ?? "");
    }
    setValues(next);
  }, [data]);

  const save = useMutation({
    mutationFn: async (groupKey: string) => {
      const raw = values[groupKey] ?? {};
      const parsed: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (v === "true" || v === "false") parsed[k] = v === "true";
        else if (v !== "" && !Number.isNaN(Number(v)) && ["cod_fee", "delivery_fee", "free_delivery_threshold", "default_eta_days"].includes(k)) parsed[k] = Number(v);
        else parsed[k] = v;
      }
      const { error } = await supabase.from("store_settings").update({ value: parsed }).eq("key", groupKey);
      if (error) throw error;
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id ?? null,
        action: "settings_updated",
        entity: "store_settings",
        entity_id: groupKey,
        new_value: parsed,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Settings</h1>
      {GROUPS.map((g) => (
        <section key={g.key} className="border border-border bg-background p-5">
          <p className="eyebrow">{g.title}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => (
              <div key={f.name} className={f.area ? "sm:col-span-2" : ""}>
                <Label className="text-xs uppercase tracking-[0.14em]">{f.label}</Label>
                {f.area ? (
                  <Textarea
                    value={values[g.key]?.[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [g.key]: { ...(values[g.key] ?? {}), [f.name]: e.target.value } })}
                    className="mt-1 rounded-none"
                  />
                ) : (
                  <Input
                    value={values[g.key]?.[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [g.key]: { ...(values[g.key] ?? {}), [f.name]: e.target.value } })}
                    className="mt-1 h-10 rounded-none"
                  />
                )}
              </div>
            ))}
          </div>
          <Button onClick={() => save.mutate(g.key)} className="mt-4 rounded-none text-xs uppercase tracking-[0.16em]">
            Save {g.title.toLowerCase()}
          </Button>
        </section>
      ))}
    </div>
  );
}
