import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader, StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useStore";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Search — Royal Street Mini Mall" },
      { name: "description", content: "Search premium clothing, watches and accessories at Royal Street Mini Mall." },
      { property: "og:title", content: "Search — Royal Street Mini Mall" },
      { property: "og:description", content: "Find your next piece." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useProducts({ search: q });
  return (
    <StoreLayout>
      <PageHeader title={q ? `Results for “${q}”` : "Search"} subtitle="Find your next piece." />
      <ProductGrid products={data} isLoading={isLoading} emptyMessage="Try a different word, or browse the collections." />
    </StoreLayout>
  );
}
