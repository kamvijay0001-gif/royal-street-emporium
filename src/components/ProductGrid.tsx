import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { discountPercent, inr } from "@/lib/format";
import type { ProductRow } from "@/hooks/useStore";

type Sort = "newest" | "popular" | "best" | "price_asc" | "price_desc" | "rating";

export function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products match your filters yet.",
}: {
  products: ProductRow[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
}) {
  const [sort, setSort] = useState<Sort>("newest");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);

  const all = products ?? [];
  const priceCeiling = Math.max(1000, ...all.map((p) => Number(p.price)));
  const allSizes = [...new Set(all.flatMap((p) => p.product_variants.map((v) => v.size)))];
  const allColors = [...new Set(all.flatMap((p) => p.product_variants.map((v) => v.color)))];
  const allBrands = [...new Set(all.map((p) => p.brand).filter(Boolean) as string[])];

  const filtered = useMemo(() => {
    let rows = all.filter((p) => {
      if (maxPrice !== null && Number(p.price) > maxPrice) return false;
      if (brands.length && !brands.includes(p.brand ?? "")) return false;
      if (sizes.length && !p.product_variants.some((v) => sizes.includes(v.size))) return false;
      if (colors.length && !p.product_variants.some((v) => colors.includes(v.color))) return false;
      if (inStockOnly && !p.product_variants.some((v) => v.stock > 0)) return false;
      if (minDiscount && discountPercent(Number(p.mrp), Number(p.price)) < minDiscount) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return Number(a.price) - Number(b.price);
        case "price_desc":
          return Number(b.price) - Number(a.price);
        case "rating":
          return Number(b.rating_avg) - Number(a.rating_avg);
        case "best":
        case "popular":
          return b.sold_count - a.sold_count;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return rows;
  }, [all, maxPrice, brands, sizes, colors, inStockOnly, minDiscount, sort]);

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const filters = (
    <div className="space-y-7">
      <div>
        <p className="eyebrow mb-3">Price up to {maxPrice === null ? inr(priceCeiling) : inr(maxPrice)}</p>
        <Slider
          value={[maxPrice ?? priceCeiling]}
          max={priceCeiling}
          min={0}
          step={100}
          onValueChange={([v]) => setMaxPrice(v ?? priceCeiling)}
        />
      </div>
      {allSizes.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Size</p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <button
                key={s}
                onClick={() => toggle(sizes, setSizes, s)}
                className={`border px-3 py-1.5 text-xs transition-colors ${sizes.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {allColors.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Colour</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c) => (
              <button
                key={c}
                onClick={() => toggle(colors, setColors, c)}
                className={`border px-3 py-1.5 text-xs transition-colors ${colors.includes(c) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      {allBrands.length > 0 && (
        <div>
          <p className="eyebrow mb-3">Brand</p>
          <div className="space-y-2">
            {allBrands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm">
                <Checkbox checked={brands.includes(b)} onCheckedChange={() => toggle(brands, setBrands, b)} />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="eyebrow mb-3">Discount</p>
        <div className="flex flex-wrap gap-2">
          {[0, 10, 25, 40].map((d) => (
            <button
              key={d}
              onClick={() => setMinDiscount(d)}
              className={`border px-3 py-1.5 text-xs transition-colors ${minDiscount === d ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
            >
              {d === 0 ? "All" : `${d}%+`}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
        </p>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-none lg:hidden">
                <SlidersHorizontal className="mr-2 size-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto p-6">
              <SheetTitle className="font-display text-xl">Filters</SheetTitle>
              <div className="mt-6">{filters}</div>
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-9 w-44 rounded-none text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="best">Best Selling</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-border py-24 text-center">
              <p className="font-display text-xl">Nothing here yet</p>
              <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
