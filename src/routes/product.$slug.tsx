import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Heart, Loader2, ShieldCheck, Star, Truck, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { PincodeCheck } from "@/components/PincodeCheck";
import { SizeHelper } from "@/components/SizeHelper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCartActions, useProduct, useToggleWishlist } from "@/hooks/useStore";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { discountPercent, inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${name} — Royal Street Mini Mall` },
        { name: "description", content: `Buy ${name} online at Royal Street Mini Mall, Gurugram. Secure payments, COD available and easy 7-day returns.` },
        { property: "og:title", content: `${name} — Royal Street Mini Mall` },
        { property: "og:description", content: `Buy ${name} online with secure payments and COD.` },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { user } = useSession();
  const { add } = useCartActions();
  const toggleWishlist = useToggleWishlist();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const variants = product?.product_variants ?? [];
  const colors = useMemo(() => [...new Map(variants.map((v) => [v.color, v.color_hex])).entries()], [variants]);
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants]);

  useEffect(() => {
    if (!product) return;
    const firstAvailable = variants.find((v) => v.stock > 0 && v.is_active) ?? variants[0];
    if (firstAvailable) {
      setColor((c) => c ?? firstAvailable.color);
      setSize((s) => s ?? firstAvailable.size);
    }
  }, [product, variants]);

  const selected = variants.find((v) => v.color === color && v.size === size);
  const images = [...(product?.product_images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
  );

  const reviews = useQuery({
    queryKey: ["reviews", product?.id],
    enabled: !!product,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, author_name, is_verified, created_at")
        .eq("product_id", product!.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const canReview = useQuery({
    queryKey: ["can-review", product?.id, user?.id],
    enabled: !!product && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("id, orders!inner(user_id, status)")
        .eq("product_id", product!.id)
        .eq("orders.user_id", user!.id)
        .eq("orders.status", "delivered")
        .limit(1);
      return (data ?? []).length > 0;
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        product_id: product!.id,
        user_id: user!.id,
        rating,
        comment,
        author_name: user!.user_metadata?.["full_name"] ?? user!.email?.split("@")[0],
        is_verified: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Thanks! Your review will appear once approved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2">
          <Skeleton className="aspect-4/5 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-lg px-4 py-32 text-center">
          <h1 className="font-display text-3xl">Product not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">It may have been removed from the store.</p>
          <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
            <Link to="/categories">Browse collections</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const off = discountPercent(Number(product.mrp), Number(product.price));
  const outOfStock = !selected || selected.stock < 1;

  async function handleAdd(buyNow = false) {
    if (!user) {
      toast.error("Please sign in to continue");
      navigate({ to: "/auth" });
      return;
    }
    if (!selected) return;
    await add.mutateAsync({ productId: product!.id, variantId: selected.id });
    if (buyNow) navigate({ to: "/checkout" });
  }

  return (
    <StoreLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            brand: product.brand ?? "Royal Street",
            description: product.description ?? undefined,
            sku: product.sku ?? undefined,
            offers: {
              "@type": "Offer",
              price: Number(product.price),
              priceCurrency: "INR",
              availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            },
          }),
        }}
      />

      <nav className="mx-auto max-w-7xl px-4 pt-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/categories" className="hover:text-foreground">Categories</Link> /{" "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 md:grid-cols-2 md:py-12">
        {/* GALLERY */}
        <div className="space-y-3">
          <div
            className="relative overflow-hidden rounded-sm bg-secondary"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
          >
            <img
              key={activeImage}
              src={images[activeImage]?.url ?? "/images/hero.jpg"}
              alt={images[activeImage]?.alt ?? product.name}
              width={900}
              height={1125}
              className={cn(
                "aspect-4/5 w-full animate-fade-in object-cover transition-transform duration-700",
                zoom && "scale-125",
              )}
            />
            {off > 0 && (
              <span className="absolute left-4 top-4 bg-primary px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-primary-foreground">
                {off}% Off
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  onClick={() => setActiveImage(i)}
                  className={cn("w-20 overflow-hidden rounded-sm border", i === activeImage ? "border-primary" : "border-transparent")}
                >
                  <img src={img.url} alt="" loading="lazy" className="aspect-4/5 object-cover" />
                </button>
              ))}
            </div>
          )}
          {product.video_url && (
            <video src={product.video_url} controls className="w-full rounded-sm" />
          )}
        </div>

        {/* DETAILS */}
        <div>
          {product.brand && <p className="eyebrow text-muted-foreground">{product.brand}</p>}
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm">
              <Star className="size-4 fill-gold text-gold" />
              {Number(product.rating_avg).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.rating_count} reviews · {product.sold_count} sold
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl">{inr(product.price)}</span>
            {off > 0 && <span className="text-base text-muted-foreground line-through">{inr(product.mrp)}</span>}
            {off > 0 && <span className="text-sm font-medium text-success">{off}% off</span>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          {/* COLOURS */}
          {colors.length > 0 && (
            <div className="mt-7">
              <p className="eyebrow mb-3">Colour: {color}</p>
              <div className="flex flex-wrap gap-3">
                {colors.map(([c, hex]) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={c}
                    className={cn(
                      "size-9 rounded-full border-2 transition-transform hover:scale-110",
                      color === c ? "border-gold" : "border-border",
                    )}
                    style={{ backgroundColor: hex ?? "#ccc" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SIZES */}
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow">Size</p>
              <SizeHelper chart={product.size_chart} />
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const v = variants.find((x) => x.size === s && x.color === color);
                const disabled = !v || v.stock < 1 || !v.is_active;
                return (
                  <button
                    key={s}
                    disabled={disabled}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-14 border px-4 py-2.5 text-sm transition-all",
                      size === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary",
                      disabled && "cursor-not-allowed border-dashed text-muted-foreground line-through opacity-50",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {selected && selected.stock > 0 && selected.stock <= 5 && (
              <p className="mt-2 text-xs text-destructive">Only {selected.stock} left in this variant</p>
            )}
            {outOfStock && color && size && (
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-destructive">
                {color} / {size} — Out of stock
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={outOfStock || add.isPending}
              onClick={() => handleAdd(false)}
              className="min-w-44 flex-1 rounded-none text-xs uppercase tracking-[0.2em]"
            >
              {add.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={outOfStock}
              onClick={() => handleAdd(true)}
              className="min-w-44 flex-1 rounded-none text-xs uppercase tracking-[0.2em]"
            >
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="ghost"
              aria-label="Add to wishlist"
              onClick={() => toggleWishlist.mutate(product.id)}
              className="rounded-none border border-border"
            >
              <Heart className="size-5" />
            </Button>
          </div>

          <div className="mt-6">
            <PincodeCheck />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Truck, label: "Free over ₹999" },
              { icon: Undo2, label: "7-day returns" },
              { icon: ShieldCheck, label: "Secure payments" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="border border-border py-4">
                <Icon className="mx-auto size-4 text-gold" />
                <p className="mt-2 text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <Accordion type="single" collapsible defaultValue="desc" className="mt-8">
            <AccordionItem value="desc">
              <AccordionTrigger className="text-sm uppercase tracking-[0.14em]">Description</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="material">
              <AccordionTrigger className="text-sm uppercase tracking-[0.14em]">Material & Care</AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                <p>{product.material}</p>
                <p>{product.care_instructions}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger className="text-sm uppercase tracking-[0.14em]">Delivery & Returns</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Dispatched in 24–48 hours. Delivery in 3–7 working days depending on your PIN code. Returns and
                exchanges accepted within 7 days of delivery with tags intact.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-display text-3xl">Reviews</h2>
        <div className="mt-6 grid gap-10 md:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {(reviews.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>
            )}
            {(reviews.data ?? []).map((r) => (
              <div key={r.id} className="border-b border-border pb-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-gold text-gold" : "text-border")} />
                  ))}
                  {r.is_verified && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.14em] text-gold">
                      <BadgeCheck className="size-3" /> Verified Purchase
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                <p className="mt-2 text-xs">{r.author_name ?? "Customer"}</p>
              </div>
            ))}
          </div>

          <div className="border border-border p-6">
            <p className="eyebrow">Write a review</p>
            {!user ? (
              <p className="mt-3 text-sm text-muted-foreground">
                <Link to="/auth" className="underline">Sign in</Link> to review products you've purchased.
              </p>
            ) : !canReview.data ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Only customers with a delivered order for this product can leave a verified review.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} star`}>
                      <Star className={cn("size-6 transition-transform hover:scale-110", i < rating ? "fill-gold text-gold" : "text-border")} />
                    </button>
                  ))}
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the fit, fabric and delivery?"
                  className="rounded-none"
                />
                <Button
                  className="w-full rounded-none text-xs uppercase tracking-[0.16em]"
                  disabled={!comment.trim() || submitReview.isPending}
                  onClick={() => submitReview.mutate()}
                >
                  Submit review
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
