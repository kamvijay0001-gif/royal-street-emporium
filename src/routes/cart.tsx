import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, useCartActions, useSettings } from "@/hooks/useStore";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Royal Street Mini Mall" },
      { name: "description", content: "Review the pieces in your shopping bag before checkout." },
      { property: "og:title", content: "Your Bag — Royal Street Mini Mall" },
      { property: "og:description", content: "Review your bag before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

export function useCartTotals(couponDiscount = 0, method: "cod" | "online" = "online") {
  const { data: lines } = useCart();
  const { data: settings } = useSettings();
  const delivery = (settings?.["delivery"] ?? {}) as Record<string, number>;
  const payments = (settings?.["payments"] ?? {}) as Record<string, number>;

  const subtotal = (lines ?? []).reduce(
    (a, l) => a + Number(l.product_variants?.price_override ?? l.products.price) * l.quantity,
    0,
  );
  const mrpTotal = (lines ?? []).reduce((a, l) => a + Number(l.products.mrp) * l.quantity, 0);
  const productDiscount = Math.max(mrpTotal - subtotal, 0);
  const threshold = Number(delivery["free_delivery_threshold"] ?? 999);
  const deliveryFee = subtotal - couponDiscount >= threshold ? 0 : Number(delivery["delivery_fee"] ?? 50);
  const codFee = method === "cod" ? Number(payments["cod_fee"] ?? 99) : 0;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee + codFee);

  return { lines: lines ?? [], subtotal, productDiscount, deliveryFee, codFee, total, threshold };
}

function CartPage() {
  const { user } = useSession();
  const { data: lines, isLoading } = useCart();
  const { setQty, remove } = useCartActions();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const totals = useCartTotals(discount);

  async function applyCoupon() {
    setApplying(true);
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code.trim())
      .eq("is_active", true)
      .maybeSingle();
    setApplying(false);
    if (!data) {
      setDiscount(0);
      toast.error("That coupon code isn't valid.");
      return;
    }
    if (totals.subtotal < Number(data.min_order)) {
      setDiscount(0);
      toast.error(`This coupon needs a minimum order of ${inr(data.min_order)}.`);
      return;
    }
    let d =
      data.discount_type === "percent"
        ? (totals.subtotal * Number(data.discount_value)) / 100
        : Number(data.discount_value);
    if (data.max_discount) d = Math.min(d, Number(data.max_discount));
    setDiscount(Math.round(d));
    toast.success(`Coupon applied — you save ${inr(Math.round(d))}`);
  }

  if (!user) {
    return (
      <StoreLayout>
        <PageHeader title="Your Bag" />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-5 text-sm text-muted-foreground">Sign in to see the pieces saved in your bag.</p>
          <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <PageHeader title="Your Bag" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
          {!isLoading && (lines ?? []).length === 0 && (
            <div className="border border-dashed border-border py-24 text-center">
              <p className="font-display text-2xl">Your bag is empty</p>
              <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
                <Link to="/new-arrivals">Start shopping</Link>
              </Button>
            </div>
          )}
          {(lines ?? []).map((l) => {
            const img =
              [...(l.products.product_images ?? [])].sort(
                (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
              )[0]?.url ?? "/images/hero.jpg";
            return (
              <div key={l.id} className="flex animate-fade-in gap-4 border border-border p-4">
                <Link to="/product/$slug" params={{ slug: l.products.slug }} className="w-24 shrink-0">
                  <img src={img} alt={l.products.name} loading="lazy" className="aspect-4/5 w-full object-cover" />
                </Link>
                <div className="flex-1">
                  <Link to="/product/$slug" params={{ slug: l.products.slug }} className="text-sm font-medium hover:text-gold">
                    {l.products.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {l.product_variants.color} · Size {l.product_variants.size}
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {inr(l.product_variants.price_override ?? l.products.price)}
                  </p>
                  {l.product_variants.stock < l.quantity && (
                    <p className="mt-1 text-xs text-destructive">Only {l.product_variants.stock} left — reduce quantity</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-border">
                      <button
                        className="px-3 py-1.5 transition-colors hover:bg-secondary"
                        onClick={() => setQty.mutate({ id: l.id, quantity: l.quantity - 1, stock: l.product_variants.stock })}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm">{l.quantity}</span>
                      <button
                        className="px-3 py-1.5 transition-colors hover:bg-secondary"
                        onClick={() => setQty.mutate({ id: l.id, quantity: l.quantity + 1, stock: l.product_variants.stock })}
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => remove.mutate(l.id)} className="text-xs">
                      <Trash2 className="mr-1.5 size-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(lines ?? []).length > 0 && (
          <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
            <p className="eyebrow">Order Summary</p>
            <div className="mt-5 flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="h-10 rounded-none"
              />
              <Button onClick={applyCoupon} disabled={!code || applying} className="h-10 rounded-none px-5 text-xs uppercase">
                {applying ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
              </Button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <Row label="Subtotal" value={inr(totals.subtotal)} />
              {totals.productDiscount > 0 && (
                <Row label="Product discount" value={`− ${inr(totals.productDiscount)}`} accent />
              )}
              {discount > 0 && <Row label="Coupon discount" value={`− ${inr(discount)}`} accent />}
              <Row label="Delivery fee" value={totals.deliveryFee === 0 ? "FREE" : inr(totals.deliveryFee)} />
              <div className="border-t border-border pt-3">
                <Row label="Grand total" value={inr(totals.total)} bold />
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              COD security fee of ₹99 is added at checkout if you choose Cash on Delivery.
            </p>

            <Button asChild className="mt-6 w-full rounded-none py-6 text-xs uppercase tracking-[0.2em]">
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
          </aside>
        )}
      </div>
    </StoreLayout>
  );
}

function Row({ label, value, accent, bold }: { label: string; value: string; accent?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-medium" : "text-muted-foreground"}>{label}</dt>
      <dd className={`${bold ? "font-display text-xl" : ""} ${accent ? "text-success" : ""}`}>{value}</dd>
    </div>
  );
}
