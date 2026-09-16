import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { useStoreInfo } from "@/hooks/useStore";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Royal Street Mini Mall — Premium Street Fashion, Gurugram" },
      { name: "description", content: "Royal Street Mini Mall is a premium street fashion store in Sukhrali, Gurugram, offering men's and women's clothing, watches and accessories." },
      { property: "og:title", content: "About Royal Street Mini Mall" },
      { property: "og:description", content: "Premium street fashion from Sukhrali, Gurugram." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const store = useStoreInfo();
  return (
    <StoreLayout>
      <PageHeader title="About Us" subtitle={"Premium Street Fashion"} />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14">
        <Reveal>
          <p className="font-display text-2xl leading-snug">
            Royal Street Mini Mall brings premium street fashion to Gurugram — curated clothing, watches and
            accessories, chosen piece by piece.
          </p>
        </Reveal>
        <Reveal>
          <p className="text-sm leading-relaxed text-muted-foreground">
            What started as a neighbourhood store at HUDA Market, Sukhrali has grown into a destination for people who
            want fashion that looks considered, not mass-produced. Every style on this site is available at the store,
            and everything you see online is stocked, checked and packed by our own team.
          </p>
        </Reveal>
        <Reveal>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We ship across India with secure online payments and Cash on Delivery, and we keep returns simple within 7
            days of delivery. If you're nearby, come and try things on — we're open {store.hours || "seven days a week"}.
          </p>
        </Reveal>
        <Reveal>
          <div className="border border-border p-6">
            <p className="eyebrow text-muted-foreground">Visit the store</p>
            <p className="mt-2 text-sm">{store.address}</p>
            <p className="mt-1 text-sm text-muted-foreground">{store.phone}</p>
            <div className="mt-5 flex gap-3">
              <Button asChild className="rounded-none text-xs uppercase tracking-[0.16em]">
                <Link to="/categories">Shop the collection</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none text-xs uppercase tracking-[0.16em]">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </StoreLayout>
  );
}
