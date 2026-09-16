import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Star, Truck } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Reveal } from "@/components/Reveal";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCategories, useProducts, useStoreInfo } from "@/hooks/useStore";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Royal Street Mini Mall — Premium Fashion Store in Gurugram" },
      {
        name: "description",
        content:
          "Premium men's and women's clothing, watches and accessories from Royal Street Mini Mall, HUDA Market Sector 17 Gurugram. Free delivery over ₹999, COD available.",
      },
      { property: "og:title", content: "Royal Street Mini Mall — Premium Fashion" },
      {
        property: "og:description",
        content: "Shop premium clothing, watches and accessories with secure payments and COD across India.",
      },
    ],
  }),
  component: Home,
});

function Section({
  title,
  eyebrow,
  link,
  children,
}: {
  title: string;
  eyebrow?: string;
  link?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <Reveal className="mb-8 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
          <h2 className="mt-2 font-display text-3xl md:text-4xl">{title}</h2>
        </div>
        {link && (
          <Link
            to={link.to}
            className="hidden items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            {link.label} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </Reveal>
      {children}
    </section>
  );
}

function Grid({ products, isLoading }: { products?: unknown[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  const list = (products ?? []).slice(0, 8);
  if (!list.length) {
    return <p className="text-sm text-muted-foreground">New pieces are being added to this edit.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
      {list.map((p, i) => (
        <Reveal key={(p as { id: string }).id} delay={i * 60}>
          <ProductCard product={p as never} />
        </Reveal>
      ))}
    </div>
  );
}

function Home() {
  const store = useStoreInfo();
  const { data: categories } = useCategories();
  const newArrivals = useProducts({ flag: "new" });
  const bestSellers = useProducts({ flag: "best" });
  const trending = useProducts({ flag: "featured" });
  const offers = useProducts({ flag: "offers" });

  const reviews = useQuery({
    queryKey: ["home-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, author_name, is_verified, created_at, products(name, slug)")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const topCats = (categories ?? []).filter((c) => !c.parent_id).slice(0, 4);

  return (
    <StoreLayout>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="Royal Street Mini Mall premium fashion campaign"
          width={1600}
          height={1200}
          className="h-[78vh] min-h-[520px] w-full object-cover object-center"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="max-w-xl text-primary-foreground">
              <p className="eyebrow animate-fade-up text-gold">Autumn Edit · Gurugram</p>
              <h1 className="mt-4 animate-fade-up font-display text-4xl leading-[1.05] sm:text-6xl md:text-7xl">
                ROYAL STREET
                <span className="block text-gold">MINI MALL</span>
              </h1>
              <p className="mt-5 max-w-md animate-fade-up text-sm leading-relaxed text-primary-foreground/80 md:text-base">
                Street-luxe clothing, watches and accessories — styled for the way India dresses now.
              </p>
              <div className="mt-8 flex animate-fade-up flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-none px-8 text-xs uppercase tracking-[0.2em]">
                  <Link to="/new-arrivals">Shop Now</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-none border-primary-foreground/60 bg-transparent px-8 text-xs uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  <Link to="/categories">Explore Collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-center md:grid-cols-4">
          {[
            { icon: Truck, label: "Free delivery over ₹999" },
            { icon: ShieldCheck, label: "Secure verified payments" },
            { icon: BadgeCheck, label: "7-day easy returns" },
            { icon: MapPin, label: "Ships across India" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="size-5 text-gold" />
              <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <Section title="Shop by Category" eyebrow="The Collections" link={{ to: "/categories", label: "All categories" }}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {topCats.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <Link to="/$category" params={{ category: c.slug }} className="group relative block overflow-hidden rounded-sm">
                <img
                  src={c.image_url ?? "/images/hero.jpg"}
                  alt={c.name}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="aspect-4/5 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/30 transition-colors duration-500 group-hover:bg-primary/45" />
                <span className="absolute bottom-5 left-5 font-display text-2xl uppercase text-primary-foreground">
                  {c.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title="New Arrivals" eyebrow="Just In" link={{ to: "/new-arrivals", label: "View all" }}>
        <Grid products={newArrivals.data} isLoading={newArrivals.isLoading} />
      </Section>

      <Section title="Best Sellers" eyebrow="Loved by Gurugram" link={{ to: "/best-sellers", label: "View all" }}>
        <Grid products={bestSellers.data} isLoading={bestSellers.isLoading} />
      </Section>

      {/* CAMPAIGN BANNER */}
      <Reveal>
        <section className="relative isolate my-10 overflow-hidden">
          <img
            src="/images/cat-watches.jpg"
            alt="Premium watch campaign"
            loading="lazy"
            width={800}
            height={1000}
            className="h-[420px] w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-primary/60" />
          <div className="absolute inset-0 grid place-items-center px-4 text-center text-primary-foreground">
            <div>
              <p className="eyebrow text-gold">The Watch Edit</p>
              <h2 className="mt-3 font-display text-4xl md:text-6xl">Time, Tailored</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80">
                Analog, digital and premium timepieces — up to 50% off this season.
              </p>
              <Button asChild size="lg" className="mt-7 rounded-none px-8 text-xs uppercase tracking-[0.2em]">
                <Link to="/$category" params={{ category: "watches" }}>
                  Shop Watches
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>

      <Section title="Trending Now" eyebrow="Featured" link={{ to: "/categories", label: "Browse all" }}>
        <Grid products={trending.data} isLoading={trending.isLoading} />
      </Section>

      <Section title="Offers" eyebrow="Save More" link={{ to: "/offers", label: "All offers" }}>
        <Grid products={offers.data} isLoading={offers.isLoading} />
      </Section>

      {/* REVIEWS */}
      <Section title="What Our Customers Say" eyebrow="Reviews">
        {reviews.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        ) : (reviews.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Verified reviews from customers appear here after their first delivered order.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {(reviews.data ?? []).map((r, i) => (
              <Reveal key={r.id} delay={i * 70}>
                <div className="h-full border border-border bg-card p-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`size-3.5 ${s < r.rating ? "fill-gold text-gold" : "text-border"}`} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                  <p className="mt-5 text-xs font-medium">{r.author_name ?? "Customer"}</p>
                  {r.is_verified && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.14em] text-gold">
                      <BadgeCheck className="size-3.5" /> Verified Purchase
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      {/* STORE */}
      <Reveal>
        <section className="border-y border-border bg-secondary/60">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2">
            <div>
              <p className="eyebrow text-gold">Visit the Store</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">{store.name}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{store.address}</p>
              <p className="mt-3 text-sm text-muted-foreground">{store.hours}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-none px-7 text-xs uppercase tracking-[0.18em]">
                  <a href={`tel:${store.phone}`}>Call {store.phone}</a>
                </Button>
                <Button asChild variant="outline" className="rounded-none px-7 text-xs uppercase tracking-[0.18em]">
                  <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer">
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
            <img
              src="/images/cat-accessories.jpg"
              alt="Royal Street Mini Mall accessories"
              loading="lazy"
              width={800}
              height={1000}
              className="h-72 w-full rounded-sm object-cover md:h-full"
            />
          </div>
        </section>
      </Reveal>
    </StoreLayout>
  );
}
