import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { useToggleWishlist, useWishlist } from "@/hooks/useStore";
import { discountPercent, inr } from "@/lib/format";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Royal Street Mini Mall" },
      { name: "description", content: "Your saved pieces at Royal Street Mini Mall." },
      { property: "og:title", content: "Wishlist — Royal Street Mini Mall" },
      { property: "og:description", content: "Your saved pieces." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useSession();
  const { data, isLoading } = useWishlist();
  const toggle = useToggleWishlist();

  return (
    <StoreLayout>
      <PageHeader title="Wishlist" subtitle="Pieces you've saved for later" />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {!user && (
          <div className="py-20 text-center">
            <Heart className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-5 text-sm text-muted-foreground">Sign in to save and revisit your favourite pieces.</p>
            <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        )}

        {user && isLoading && (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-4/5 w-full" />)}
          </div>
        )}

        {user && !isLoading && (data ?? []).length === 0 && (
          <div className="border border-dashed border-border py-24 text-center">
            <p className="font-display text-2xl">Nothing saved yet</p>
            <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
              <Link to="/new-arrivals">Browse new arrivals</Link>
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {(data ?? []).map((w) => {
            const p = w.products;
            if (!p) return null;
            const img =
              [...(p.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position)[0]?.url ??
              "/images/hero.jpg";
            const off = discountPercent(Number(p.mrp), Number(p.price));
            return (
              <div key={w.id} className="group animate-fade-up">
                <div className="relative overflow-hidden bg-secondary">
                  <Link to="/product/$slug" params={{ slug: p.slug }}>
                    <img src={img} alt={p.name} loading="lazy" className="aspect-4/5 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>
                  <button
                    onClick={() => toggle.mutate(p.id)}
                    aria-label="Remove from wishlist"
                    className="absolute right-3 top-3 grid size-8 place-items-center bg-background/90 transition-colors hover:bg-background"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <Link to="/product/$slug" params={{ slug: p.slug }} className="mt-3 block text-sm hover:text-gold">
                  {p.name}
                </Link>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">{inr(p.price)}</span>{" "}
                  {off > 0 && <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </StoreLayout>
  );
}
