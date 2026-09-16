import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useStore";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Coupons — Royal Street Mini Mall" },
      { name: "description", content: "Live discounts and coupon codes on premium fashion at Royal Street Mini Mall, Gurugram." },
      { property: "og:title", content: "Offers & Coupons — Royal Street Mini Mall" },
      { property: "og:description", content: "Live discounts and coupon codes on premium fashion." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { data, isLoading } = useProducts({ flag: "offers" });
  const coupons = useQuery({
    queryKey: ["active-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("code, description, discount_type, discount_value, min_order")
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <StoreLayout>
      <PageHeader title="Offers" subtitle="Season discounts and coupon codes, updated by the store." />
      {(coupons.data ?? []).length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pt-10">
          <div className="grid gap-4 md:grid-cols-3">
            {(coupons.data ?? []).map((c) => (
              <div key={c.code} className="border border-dashed border-gold bg-gold-soft/30 p-6">
                <p className="font-display text-2xl">{c.code}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {c.discount_type === "percent" ? `${c.discount_value}% off` : `${inr(c.discount_value)} off`} · min order {inr(c.min_order)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <ProductGrid products={data} isLoading={isLoading} emptyMessage="No discounted products right now." />
    </StoreLayout>
  );
}
