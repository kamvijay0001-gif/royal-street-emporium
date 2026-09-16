import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/layout/StoreLayout";
import { Reveal } from "@/components/Reveal";
import { useCategories } from "@/hooks/useStore";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories — Royal Street Mini Mall" },
      { name: "description", content: "Browse every category at Royal Street Mini Mall: men, women, watches and accessories." },
      { property: "og:title", content: "All Categories — Royal Street Mini Mall" },
      { property: "og:description", content: "Browse men, women, watches and accessories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const parents = (data ?? []).filter((c) => !c.parent_id);

  return (
    <StoreLayout>
      <PageHeader title="Categories" subtitle="Everything in the store, organised." />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        {parents.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
              <Link to="/$category" params={{ category: p.slug }} className="group block overflow-hidden rounded-sm">
                <img
                  src={p.image_url ?? "/images/hero.jpg"}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:aspect-4/5"
                />
              </Link>
              <div>
                <h2 className="font-display text-3xl">{p.name}</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(data ?? [])
                    .filter((c) => c.parent_id === p.id)
                    .map((c) => (
                      <Link
                        key={c.id}
                        to="/$category"
                        params={{ category: c.slug }}
                        className="border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        {c.name}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </StoreLayout>
  );
}
