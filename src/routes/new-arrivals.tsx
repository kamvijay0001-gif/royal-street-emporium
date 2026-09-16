import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useStore";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — Royal Street Mini Mall" },
      { name: "description", content: "The newest clothing, watches and accessories to land at Royal Street Mini Mall, Gurugram." },
      { property: "og:title", content: "New Arrivals — Royal Street Mini Mall" },
      { property: "og:description", content: "Fresh drops in clothing, watches and accessories." },
    ],
  }),
  component: () => {
    const { data, isLoading } = useProducts({ flag: "new" });
    return (
      <StoreLayout>
        <PageHeader title="New Arrivals" subtitle="Fresh from the floor at Sector 17." />
        <ProductGrid products={data} isLoading={isLoading} emptyMessage="New pieces drop every week — check back soon." />
      </StoreLayout>
    );
  },
});
