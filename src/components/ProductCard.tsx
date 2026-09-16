import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { discountPercent, inr } from "@/lib/format";
import { useToggleWishlist, type ProductRow } from "@/hooks/useStore";
import { cn } from "@/lib/utils";

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-4/5 w-full rounded-sm" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ProductCard({ product }: { product: ProductRow }) {
  const toggle = useToggleWishlist();
  const image =
    [...(product.product_images ?? [])].sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
    )[0]?.url ?? "/images/hero.jpg";
  const off = discountPercent(Number(product.mrp), Number(product.price));
  const variants = product.product_variants ?? [];
  const inStock = variants.some((v) => v.stock > 0 && v.is_active);
  const colors = [...new Map(variants.map((v) => [v.color, v.color_hex])).entries()];
  const sizes = [...new Set(variants.filter((v) => v.size !== "One Size").map((v) => v.size))];

  return (
    <article className="group relative">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative overflow-hidden rounded-sm bg-secondary">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            width={900}
            height={1125}
            className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/5" />
          {off > 0 && (
            <span className="absolute left-3 top-3 bg-primary px-2 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-primary-foreground">
              {off}% Off
            </span>
          )}
          {!inStock && (
            <span className="absolute inset-x-0 bottom-0 bg-primary/85 py-2 text-center text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <Button
        variant="secondary"
        size="icon"
        aria-label="Add to wishlist"
        onClick={() => toggle.mutate(product.id)}
        className="absolute right-3 top-3 size-9 rounded-full opacity-0 shadow-elegant transition-all duration-300 group-hover:opacity-100 active:scale-90"
      >
        <Heart className={cn("size-4", toggle.isSuccess && toggle.data && "fill-current")} />
      </Button>

      <div className="mt-3 space-y-1">
        {product.brand && <p className="eyebrow text-muted-foreground">{product.brand}</p>}
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-1 text-sm font-medium transition-colors hover:text-gold"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{inr(product.price)}</span>
          {off > 0 && <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>}
        </div>
        <div className="flex items-center gap-3 pt-1">
          {Number(product.rating_count) > 0 ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-gold text-gold" />
              {Number(product.rating_avg).toFixed(1)} ({product.rating_count})
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">New</span>
          )}
          <span className="flex items-center gap-1">
            {colors.slice(0, 4).map(([color, hex]) => (
              <span
                key={color}
                title={color}
                className="size-3 rounded-full border border-border"
                style={{ backgroundColor: hex ?? "#ccc" }}
              />
            ))}
          </span>
          {sizes.length > 0 && (
            <span className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              {sizes.slice(0, 4).join(" · ")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
