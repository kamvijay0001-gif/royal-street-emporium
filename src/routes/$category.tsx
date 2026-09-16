import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/layout/StoreLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useCategories, useProducts } from "@/hooks/useStore";

const BLURBS: Record<string, string> = {
  men: "Tees, shirts, denim and layers cut for everyday street-luxe.",
  women: "Dresses, co-ords, kurtis and denim in premium fabrics.",
  watches: "Analog, digital and premium timepieces for every wrist.",
  accessories: "Belts, caps, sunglasses and wallets to finish the look.",
};

export const Route = createFileRoute("/$category")({
  head: ({ params }) => {
    const title = params.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${title} — Royal Street Mini Mall` },
        { name: "description", content: `Shop ${title.toLowerCase()} at Royal Street Mini Mall, Gurugram. Premium fashion with COD and secure online payments.` },
        { property: "og:title", content: `${title} — Royal Street Mini Mall` },
        { property: "og:description", content: `Premium ${title.toLowerCase()} from Royal Street Mini Mall.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data, isLoading } = useProducts({ categorySlug: category });

  const cat = (categories ?? []).find((c) => c.slug === category);
  if (!catsLoading && categories && !cat) throw notFound();

  return (
    <StoreLayout>
      <PageHeader title={cat?.name ?? "Collection"} subtitle={BLURBS[category] ?? "Handpicked pieces from the store."} />
      <ProductGrid products={data} isLoading={isLoading || catsLoading} />
    </StoreLayout>
  );
}
