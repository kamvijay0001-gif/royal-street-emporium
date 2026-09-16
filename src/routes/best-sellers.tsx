import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useStore";

export const Route = createFileRoute("/best-sellers")({
  head: () => ({
    meta: [
      { title: "Best Sellers — Royal Street Mini Mall" },
      { name: "description", content: "The most-loved pieces at Royal Street Mini Mall, ranked by real sales." },
      { property: "og:title", content: "Best Sellers — Royal Street Mini Mall" },
      { property: "og:description", content: "Our most-loved clothing, watches and accessories." },
    ],
  }),
  component: () => {
    const { data, isLoading } = useProducts({ flag: "best" });
    return (
      <StoreLayout>
        <PageHeader title="Best Sellers" subtitle="Ranked by what our customers actually buy." />
        <ProductGrid products={data} isLoading={isLoading} />
      </StoreLayout>
    );
  },
});
