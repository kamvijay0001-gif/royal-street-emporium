import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

const EMPTY = {
  full_name: "",
  phone: "",
  house: "",
  street: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  instructions: "",
};

export const Route = createFileRoute("/account/addresses")({
  component: Addresses,
});

function Addresses() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const addAddress = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("addresses").insert({ ...form, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed");
    },
  });

  const valid = form.full_name && form.phone && form.city && form.state && /^\d{6}$/.test(form.pincode);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl">Saved addresses</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {isLoading && <Skeleton className="h-28 w-full" />}
          {!isLoading && (data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">You haven't saved any addresses yet.</p>
          )}
          {(data ?? []).map((a) => (
            <div key={a.id} className="border border-border p-4 text-sm">
              <div className="flex items-start justify-between">
                <p className="font-medium">{a.full_name}</p>
                <button onClick={() => removeAddress.mutate(a.id)} aria-label="Remove address">
                  <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.house} {a.street}, {a.landmark} {a.city}, {a.district} {a.state} — {a.pincode}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{a.phone}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Add a new address</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["full_name", "Full name"],
              ["phone", "Mobile"],
              ["house", "House / Flat"],
              ["street", "Street / Area"],
              ["landmark", "Landmark"],
              ["city", "Village / Town / City"],
              ["district", "District"],
              ["state", "State"],
              ["pincode", "PIN code"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label className="text-xs uppercase tracking-[0.14em]">{label}</Label>
              <Input
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: key === "pincode" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value })
                }
                className="mt-1 h-11 rounded-none"
              />
            </div>
          ))}
        </div>
        <Button
          onClick={() => addAddress.mutate()}
          disabled={!valid || addAddress.isPending}
          className="mt-5 rounded-none px-8 text-xs uppercase tracking-[0.16em]"
        >
          Save address
        </Button>
      </section>
    </div>
  );
}
