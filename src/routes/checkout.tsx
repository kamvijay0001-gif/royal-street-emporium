import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, QrCode, Wallet } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PincodeCheck } from "@/components/PincodeCheck";
import { useSession } from "@/hooks/useSession";
import { useCart, useSettings } from "@/hooks/useStore";
import { useCartTotals } from "./cart";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Royal Street Mini Mall" },
      { name: "description", content: "Secure checkout with UPI, cards, net banking and Cash on Delivery." },
      { property: "og:title", content: "Checkout — Royal Street Mini Mall" },
      { property: "og:description", content: "Secure checkout with UPI and Cash on Delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = ["Customer", "Address", "Review", "Payment"];

function CheckoutPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const { data: lines } = useCart();
  const { data: settings } = useSettings();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"online" | "cod">("online");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", whatsapp: "" });
  const [address, setAddress] = useState({
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
  });
  const [saveAddress, setSaveAddress] = useState(true);

  const totals = useCartTotals(discount, method);

  const saved = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("full_name, email, phone, whatsapp")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setCustomer((c) => ({
          name: c.name || data?.full_name || "",
          phone: c.phone || data?.phone || "",
          email: c.email || data?.email || user.email || "",
          whatsapp: c.whatsapp || data?.whatsapp || "",
        }));
      });
  }, [user]);

  if (!loading && !user) {
    return (
      <StoreLayout>
        <PageHeader title="Checkout" />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to complete your order.</p>
          <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  if ((lines ?? []).length === 0) {
    return (
      <StoreLayout>
        <PageHeader title="Checkout" />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
            <Link to="/new-arrivals">Shop new arrivals</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  async function applyCoupon() {
    const { data } = await supabase.from("coupons").select("*").ilike("code", coupon.trim()).eq("is_active", true).maybeSingle();
    if (!data || totals.subtotal < Number(data.min_order)) {
      setDiscount(0);
      toast.error("Coupon not valid for this order.");
      return;
    }
    let d = data.discount_type === "percent" ? (totals.subtotal * Number(data.discount_value)) / 100 : Number(data.discount_value);
    if (data.max_discount) d = Math.min(d, Number(data.max_discount));
    setDiscount(Math.round(d));
    toast.success("Coupon applied");
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      if (saveAddress) {
        await supabase.from("addresses").insert({ ...address, user_id: user!.id });
      }
      const { data, error } = await supabase.rpc("place_order", {
        payload: {
          items: (lines ?? []).map((l) => ({ variant_id: l.variant_id, quantity: l.quantity })),
          customer,
          address,
          coupon_code: discount > 0 ? coupon.trim().toUpperCase() : "",
          payment_method: method,
        },
      });
      if (error) throw error;
      const result = data as unknown as { order_id: string };
      navigate({ to: "/order/$id", params: { id: result.order_id } });
    } catch (e) {
      toast.error((e as Error).message || "We couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  const stepValid =
    step === 0
      ? customer.name.length > 1 && /^\+?\d{10,13}$/.test(customer.phone)
      : step === 1
        ? !!(address.full_name && address.phone && address.city && address.state && /^\d{6}$/.test(address.pincode))
        : true;

  const upiId = String(((settings?.["payments"] ?? {}) as Record<string, string>)["upi_id"] ?? "9053346151@upi");

  return (
    <StoreLayout>
      <PageHeader title="Checkout" />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ol className="mb-10 flex items-center">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border text-xs transition-all duration-300",
                    i < step && "border-gold bg-gold text-primary",
                    i === step && "border-primary bg-primary text-primary-foreground",
                    i > step && "border-border text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn("hidden text-xs uppercase tracking-[0.14em] sm:inline", i === step ? "text-foreground" : "text-muted-foreground")}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && <span className={cn("mx-3 h-px flex-1", i < step ? "bg-gold" : "bg-border")} />}
            </li>
          ))}
        </ol>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div key={step} className="animate-fade-up space-y-5">
            {step === 0 && (
              <>
                <Field label="Full Name" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} />
                <Field label="Mobile Number" value={customer.phone} onChange={(v) => setCustomer({ ...customer, phone: v })} />
                <Field label="Email" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} />
                <Field label="WhatsApp Number (optional)" value={customer.whatsapp} onChange={(v) => setCustomer({ ...customer, whatsapp: v })} />
              </>
            )}

            {step === 1 && (
              <>
                {(saved.data ?? []).length > 0 && (
                  <div className="space-y-2">
                    <p className="eyebrow">Saved addresses</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(saved.data ?? []).map((a) => (
                        <button
                          key={a.id}
                          onClick={() =>
                            setAddress({
                              full_name: a.full_name,
                              phone: a.phone,
                              house: a.house ?? "",
                              street: a.street ?? "",
                              landmark: a.landmark ?? "",
                              city: a.city,
                              district: a.district ?? "",
                              state: a.state,
                              pincode: a.pincode,
                              instructions: a.instructions ?? "",
                            })
                          }
                          className="border border-border p-3 text-left text-xs transition-colors hover:border-primary"
                        >
                          <span className="font-medium">{a.full_name}</span>
                          <br />
                          {a.house} {a.street}, {a.city} — {a.pincode}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" value={address.full_name} onChange={(v) => setAddress({ ...address, full_name: v })} />
                  <Field label="Mobile" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} />
                  <Field label="House / Flat" value={address.house} onChange={(v) => setAddress({ ...address, house: v })} />
                  <Field label="Street / Area" value={address.street} onChange={(v) => setAddress({ ...address, street: v })} />
                  <Field label="Landmark" value={address.landmark} onChange={(v) => setAddress({ ...address, landmark: v })} />
                  <Field label="Village / Town / City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
                  <Field label="District" value={address.district} onChange={(v) => setAddress({ ...address, district: v })} />
                  <Field label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
                  <Field label="PIN Code" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) })} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-[0.14em]">Delivery instructions</Label>
                  <Textarea
                    value={address.instructions}
                    onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                    className="mt-1 rounded-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={saveAddress} onCheckedChange={(v) => setSaveAddress(!!v)} /> Save this address to my account
                </label>
                <PincodeCheck />
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {(lines ?? []).map((l) => (
                  <div key={l.id} className="flex items-center justify-between border-b border-border pb-3 text-sm">
                    <div>
                      <p className="font-medium">{l.products.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.product_variants.color} · {l.product_variants.size} · Qty {l.quantity}
                      </p>
                    </div>
                    <p>{inr(Number(l.product_variants.price_override ?? l.products.price) * l.quantity)}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="h-10 rounded-none" />
                  <Button onClick={applyCoupon} disabled={!coupon} className="h-10 rounded-none px-5 text-xs uppercase">Apply</Button>
                </div>
                <div className="border border-border p-4 text-sm">
                  <p className="font-medium">{address.full_name}</p>
                  <p className="mt-1 text-muted-foreground">
                    {address.house} {address.street}, {address.landmark} {address.city}, {address.district} {address.state} — {address.pincode}
                  </p>
                  <p className="mt-1 text-muted-foreground">{address.phone}</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <button
                  onClick={() => setMethod("online")}
                  className={cn("flex w-full items-start gap-3 border p-5 text-left transition-colors", method === "online" ? "border-primary" : "border-border")}
                >
                  <QrCode className="mt-0.5 size-5 text-gold" />
                  <div>
                    <p className="text-sm font-medium">Pay Online — UPI, Cards, Net Banking</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      A UPI QR for your exact order amount is generated after you place the order. Payment is confirmed
                      only after it is verified on our side — no COD fee.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Store UPI ID: {upiId}</p>
                  </div>
                </button>
                <button
                  onClick={() => setMethod("cod")}
                  className={cn("flex w-full items-start gap-3 border p-5 text-left transition-colors", method === "cod" ? "border-primary" : "border-border")}
                >
                  <Wallet className="mt-0.5 size-5 text-gold" />
                  <div>
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pay the courier when your order arrives. A ₹99 COD security fee applies.
                    </p>
                  </div>
                </button>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-none text-xs uppercase tracking-[0.16em]"
              >
                Back
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!stepValid}
                  className="rounded-none px-8 text-xs uppercase tracking-[0.18em]"
                >
                  Continue
                </Button>
              ) : (
                <Button onClick={placeOrder} disabled={placing} className="rounded-none px-8 text-xs uppercase tracking-[0.18em]">
                  {placing && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Place Order · {inr(totals.total)}
                </Button>
              )}
            </div>
          </div>

          <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
            <p className="eyebrow">Summary</p>
            <dl className="mt-5 space-y-3 text-sm">
              <SumRow label="Subtotal" value={inr(totals.subtotal)} />
              {totals.productDiscount > 0 && <SumRow label="Product discount" value={`− ${inr(totals.productDiscount)}`} />}
              {discount > 0 && <SumRow label="Coupon discount" value={`− ${inr(discount)}`} />}
              <SumRow label="Delivery fee" value={totals.deliveryFee === 0 ? "FREE" : inr(totals.deliveryFee)} />
              {method === "cod" && <SumRow label="COD security fee" value={inr(totals.codFee)} />}
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <dt className="font-medium">Grand total</dt>
                  <dd className="font-display text-2xl">{inr(totals.total)}</dd>
                </div>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Final amount is recalculated and verified on our server before your order is created.
            </p>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-[0.14em]">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 rounded-none" />
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
