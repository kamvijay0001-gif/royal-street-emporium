import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Royal Street Mini Mall" },
      { name: "description", content: "Dispatch timelines, delivery charges and delivery estimates for orders from Royal Street Mini Mall, Gurugram." },
      { property: "og:title", content: "Shipping Policy — Royal Street Mini Mall" },
      { property: "og:description", content: "Dispatch timelines and delivery charges." },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Shipping Policy"
      subtitle="How and when your order reaches you"
      policyKeys={[{ key: "shipping", heading: "Dispatch & Delivery" }]}
    />
  ),
});
