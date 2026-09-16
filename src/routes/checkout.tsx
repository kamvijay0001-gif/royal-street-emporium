import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, QrCode, Wallet } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
      { name: "description", content: "Quick one-page checkout with UPI and Cash on Delivery." },
      { property: "og:title", content: "Checkout — Royal Street Mini Mall" },
      { property: "og:description", content: "Quick one-page checkout with UPI and Cash on Delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const { data: lines } = useCart();
  const { data: settings } = useSettings();
  const [method, setMethod] = useState<"online" | "cod">("online");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [touched, setTouched] = useState(false);

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
  const [selectedSaved, setSelectedSaved] = useState<string>("new");

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

  // Preselect the first saved address so returning customers just tap Place Order.
  useEffect(() => {
    const list = saved.data ?? [];
    if (list.length === 0 || selectedSaved !== "new") return;
    const a = list[0]!;
    setSelectedSaved(a.id);
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
    });
    setSaveAddress(false);
  }, [saved.data, selectedSaved]);

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

  const phoneOk = /^\+?\d{10,13}$/.test(customer.phone.trim());
  const valid =
    customer.name.trim().length > 1 &&
    phoneOk &&
    address.house.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.state.trim().length > 0 &&
    /^\d{6}$/.test(address.pincode);

  async function placeOrder() {
    setTouched(true);
    if (!valid) {
      toast.error("Please fill your name, mobile number and delivery address.");
      return;
    }
    setPlacing(true);
    const finalAddress = {
      ...address,
      full_name: address.full_name.trim() || customer.name.trim(),
      phone: address.phone.trim() || customer.phone.trim(),
    };
    try {
      if (saveAddress) {
        await supabase.from("addresses").insert({ ...finalAddress, user_id: user!.id });
      }
      const { data, error } = await supabase.rpc("place_order", {
        payload: {
          items: (lines ?? []).map((l) => ({ variant_id: l.variant_id, quantity: l.quantity })),
          customer,
          address: finalAddress,
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

  const upiId = String(((settings?.["payments"] ?? {}) as Record<string, string>)["upi_id"] ?? "9053346151@upi");
  const savedList = saved.data ?? [];

  return (
    <StoreLayout>
      <PageHeader title="Checkout" />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            <section className="animate-fade-up space-y-4">
              <p className="eyebrow">1 · Your details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  value={customer.name}
                  onChange={(v) => setCustomer({ ...customer, name: v })}
                  invalid={touched && customer.name.trim().length < 2}
                />
                <Field
                  label="Mobile Number"
                  value={customer.phone}
                  onChange={(v) => setCustomer({ ...customer, phone: v })}
                  invalid={touched && !phoneOk}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowMore((s) => !s)}
                className="text-xs uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4"
              >
                {showMore ? "Hide" : "Add"} email / WhatsApp (optional)
              </button>
              {showMore && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email (optional)" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} />
                  <Field label="WhatsApp (optional)" value={customer.whatsapp} onChange={(v) => setCustomer({ ...customer, whatsapp: v })} />
                </div>
              )}
            </section>

            <section className="animate-fade-up space-y-4">
              <p className="eyebrow">2 · Delivery address</p>
              {savedList.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {savedList.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedSaved(a.id);
                        setSaveAddress(false);
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
                        });
                      }}
                      className={cn(
                        "border p-3 text-left text-xs transition-colors",
                        selectedSaved === a.id ? "border-primary" : "border-border hover:border-primary",
                      )}
                    >
                      <span className="font-medium">{a.full_name}</span>
                      <br />
                      {a.house} {a.street}, {a.city} — {a.pincode}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedSaved("new");
                      setSaveAddress(true);
                      setAddress({
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
                    }}
                    className={cn(
                      "border p-3 text-left text-xs transition-colors",
                      selectedSaved === "new" ? "border-primary" : "border-border hover:border-primary",
                    )}
                  >
                    + Use a new address
                  </button>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="House / Flat & Street"
                  value={address.house}
                  onChange={(v) => setAddress({ ...address, house: v })}
                  invalid={touched && !address.house.trim()}
                />
                <Field label="Area / Landmark (optional)" value={address.street} onChange={(v) => setAddress({ ...address, street: v })} />
                <Field
                  label="City"
                  value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                  invalid={touched && !address.city.trim()}
                />
                <Field
                  label="State"
                  value={address.state}
                  onChange={(v) => setAddress({ ...address, state: v })}
                  invalid={touched && !address.state.trim()}
                />
                <Field
                  label="PIN Code"
                  value={address.pincode}
                  onChange={(v) => setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) })}
                  invalid={touched && !/^\d{6}$/.test(address.pincode)}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Delivery instructions (optional)</Label>
                <Textarea
                  value={address.instructions}
                  onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                  className="mt-1 rounded-none"
                />
              </div>
              {selectedSaved === "new" && (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={saveAddress} onCheckedChange={(v) => setSaveAddress(!!v)} /> Save this address for next time
                </label>
              )}
            </section>

            <section className="animate-fade-up space-y-4">
              <p className="eyebrow">3 · Payment</p>
              <button
                onClick={() => setMethod("online")}
                className={cn("flex w-full items-start gap-3 border p-5 text-left transition-colors", method === "online" ? "border-primary" : "border-border")}
              >
                <QrCode className="mt-0.5 size-5 text-gold" />
                <div>
                  <p className="text-sm font-medium">Pay Online — UPI QR</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    A UPI QR for your exact amount appears right after you place the order. No COD fee. UPI ID: {upiId}
                  </p>
                </div>
              </button>
              <button
                onClick={() => setMethod("cod")}
                className={cn("flex w-full items-start gap-3 border p-5 text-left transition-colors", method === "cod" ? "border-primary" : "border-border")}
              >
                <Wallet className="mt-0.5 size-5 text-gold" />
                <div>
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="mt-1 text-xs text-muted-foreground">Pay the courier on arrival. ₹99 COD security fee applies.</p>
                </div>
              </button>
            </section>
          </div>

          <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
            <p className="eyebrow">Order summary</p>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              {(lines ?? []).map((l) => (
                <div key={l.id} className="flex justify-between gap-3">
                  <span>
                    {l.products.name} · {l.product_variants.size} × {l.quantity}
                  </span>
                  <span className="whitespace-nowrap text-foreground">
                    {inr(Number(l.product_variants.price_override ?? l.products.price) * l.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="h-10 rounded-none" />
              <Button onClick={applyCoupon} disabled={!coupon} className="h-10 rounded-none px-5 text-xs uppercase">
                Apply
              </Button>
            </div>
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
            <Button
              onClick={placeOrder}
              disabled={placing}
              className="mt-6 h-12 w-full rounded-none text-xs uppercase tracking-[0.18em]"
            >
              {placing && <Loader2 className="mr-2 size-4 animate-spin" />}
              Place Order · {inr(totals.total)}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Final amount is recalculated and verified on our server before your order is created.
            </p>
          </aside>
        </div>
      </div>

      {/* Sticky mobile place-order bar */}
      <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <Button onClick={placeOrder} disabled={placing} className="h-12 w-full rounded-none text-xs uppercase tracking-[0.18em]">
          {placing && <Loader2 className="mr-2 size-4 animate-spin" />}
          Place Order · {inr(totals.total)}
        </Button>
      </div>
    </StoreLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean | undefined;
}) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-[0.14em]">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("mt-1 h-11 rounded-none", invalid && "border-destructive")}
      />
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
